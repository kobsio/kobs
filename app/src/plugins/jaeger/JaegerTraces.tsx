import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { GetTracesRequest, GetTracesResponse, JaegerPromiseClient } from 'proto/jaeger_grpc_web_pb';
import { IJaegerOptions, ITrace, addColorForProcesses, encodeTags } from 'plugins/jaeger/helpers';
import JaegerTracesChart from 'plugins/jaeger/JaegerTracesChart';
import JaegerTracesTrace from 'plugins/jaeger/JaegerTracesTrace';
import { apiURL } from 'utils/constants';

// jaegerService is the gRPC service to get the traces from a Jaeger instance.
const jaegerService = new JaegerPromiseClient(apiURL, null, null);

interface IDataState {
  traces: ITrace[];
  error: string;
  isLoading: boolean;
}

interface IJaegerTracesProps extends IJaegerOptions {
  name: string;
  queryName: string;
  setTrace?: (trace: React.ReactNode) => void;
}

const JaegerTraces: React.FunctionComponent<IJaegerTracesProps> = ({
  name,
  queryName,
  limit,
  maxDuration,
  minDuration,
  operation,
  service,
  tags,
  timeEnd,
  timeStart,
  setTrace,
}: IJaegerTracesProps) => {
  const [data, setData] = useState<IDataState>({
    error: '',
    isLoading: true,
    traces: [],
  });

  const fetchTraces = useCallback(async (): Promise<void> => {
    try {
      setData({ error: '', isLoading: true, traces: [] });

      const getTracesRequest = new GetTracesRequest();
      getTracesRequest.setName(name);
      getTracesRequest.setLimit(limit);
      getTracesRequest.setMaxduration(maxDuration);
      getTracesRequest.setMinduration(minDuration);
      getTracesRequest.setOperation(operation);
      getTracesRequest.setService(service);
      getTracesRequest.setTags(encodeTags(tags));
      getTracesRequest.setTimeend(timeEnd);
      getTracesRequest.setTimestart(timeStart);

      const getTracesResponse: GetTracesResponse = await jaegerService.getTraces(getTracesRequest, null);
      const traces = JSON.parse(getTracesResponse.toObject().traces).data;

      setData({ error: '', isLoading: false, traces: addColorForProcesses(traces) });
    } catch (err) {
      setData({ error: err.message, isLoading: false, traces: [] });
    }
  }, [name, limit, maxDuration, minDuration, operation, service, tags, timeEnd, timeStart]);

  // useEffect is used to call the fetchTraces function every time the required props are changing.
  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  // When the isLoading property is true, we render a spinner as loading indicator for the user.
  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // In case of an error, we show an Alert component, with the error message, while the request failed.
  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get traces"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchTraces}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      <JaegerTracesChart traces={data.traces} />

      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>

      {data.traces.map((trace, index) => (
        <React.Fragment key={index}>
          <JaegerTracesTrace name={name} trace={trace} setTrace={setTrace} />
          <p>&nbsp;</p>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default JaegerTraces;
