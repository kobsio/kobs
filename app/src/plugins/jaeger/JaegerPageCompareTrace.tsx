import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { GetTraceRequest, GetTraceResponse, JaegerPromiseClient } from 'proto/jaeger_grpc_web_pb';
import { ITrace, addColorForProcesses } from 'plugins/jaeger/helpers';
import JaegerSpans from 'plugins/jaeger/JaegerSpans';
import JaegerTraceActions from 'plugins/jaeger/JaegerTraceActions';
import JaegerTraceHeader from 'plugins/jaeger/JaegerTraceHeader';
import { apiURL } from 'utils/constants';
import { getRootSpan } from 'plugins/jaeger/helpers';

// jaegerService is the gRPC service to get the traces from a Jaeger instance.
const jaegerService = new JaegerPromiseClient(apiURL, null, null);

interface IDataState {
  trace?: ITrace;
  error: string;
  isLoading: boolean;
}

interface IJaegerPageCompareTraceProps {
  name: string;
  traceID: string;
  trace?: ITrace;
}

// JaegerPageCompareTrace loads a single trace.
const JaegerPageCompareTrace: React.FunctionComponent<IJaegerPageCompareTraceProps> = ({
  name,
  traceID,
  trace,
}: IJaegerPageCompareTraceProps) => {
  const history = useHistory();
  const [data, setData] = useState<IDataState>({ error: '', isLoading: true, trace: undefined });

  // fetchTrace returns a single trace for the give trace id.
  const fetchTrace = useCallback(async (): Promise<void> => {
    if (trace && trace.traceID === traceID) {
      setData({ error: '', isLoading: false, trace: addColorForProcesses([trace])[0] });
    } else {
      try {
        setData({ error: '', isLoading: true, trace: undefined });

        const getTraceRequest = new GetTraceRequest();
        getTraceRequest.setName(name);
        getTraceRequest.setTraceid(traceID);

        const getTraceResponse: GetTraceResponse = await jaegerService.getTrace(getTraceRequest, null);
        const traceData = JSON.parse(getTraceResponse.toObject().traces).data;

        setData({
          error: '',
          isLoading: false,
          trace: traceData.length === 1 ? addColorForProcesses(traceData)[0] : undefined,
        });
      } catch (err) {
        setData({ error: err.message, isLoading: false, trace: undefined });
      }
    }
  }, [name, traceID, trace]);

  // useEffect is used to call the fetchTrace function every time the required props are changing.
  useEffect(() => {
    fetchTrace();
  }, [fetchTrace]);

  // When the loading identicator is true, we show a spinner component.
  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  // When an error occured during the execution of the fetchTrace function, we show the error in an Alert component.
  if (data.error || !data.trace) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          title="Could not get trace"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
              <AlertActionLink onClick={fetchTrace}>Retry</AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{data.error ? data.error : 'Trace is undefined'}</p>
        </Alert>
      </PageSection>
    );
  }

  const rootSpan = data.trace && data.trace.spans.length > 0 ? getRootSpan(data.trace.spans) : undefined;
  if (!rootSpan) {
    return null;
  }

  return (
    <React.Fragment>
      <Grid>
        <GridItem sm={11} md={11} lg={11} xl={11} xl2={11}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <Title className="pf-u-text-nowrap pf-u-text-truncate" headingLevel="h6" size="xl">
              {data.trace.processes[rootSpan.processID].serviceName}: {rootSpan.operationName}
              <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{data.trace.traceID}</span>
            </Title>
            <p>
              <JaegerTraceHeader trace={data.trace} rootSpan={rootSpan} />
            </p>
          </PageSection>
        </GridItem>

        <GridItem sm={1} md={1} lg={1} xl={1} xl2={1}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <div style={{ float: 'right', textAlign: 'right' }}>
              <JaegerTraceActions name={name} trace={data.trace} />
            </div>
          </PageSection>
        </GridItem>

        <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection variant={PageSectionVariants.default}>
            <JaegerSpans trace={data.trace} />
          </PageSection>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

export default JaegerPageCompareTrace;
