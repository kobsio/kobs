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
import { ITrace, addColorForProcesses, formatTraceTime, getDuration } from 'plugins/jaeger/helpers';
import JaegerSpans from 'plugins/jaeger/JaegerSpans';
import { apiURL } from 'utils/constants';

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
  headerComponent: React.ReactNode;
}

// JaegerPageCompareTrace loads a single trace.
const JaegerPageCompareTrace: React.FunctionComponent<IJaegerPageCompareTraceProps> = ({
  name,
  traceID,
  headerComponent,
}: IJaegerPageCompareTraceProps) => {
  const history = useHistory();
  const [data, setData] = useState<IDataState>({ error: '', isLoading: true, trace: undefined });

  // fetchTrace returns a single trace for the give trace id.
  const fetchTrace = useCallback(async (): Promise<void> => {
    try {
      setData({ error: '', isLoading: true, trace: undefined });

      const getTraceRequest = new GetTraceRequest();
      getTraceRequest.setName(name);
      getTraceRequest.setTraceid(traceID);

      const getTraceResponse: GetTraceResponse = await jaegerService.getTrace(getTraceRequest, null);
      const trace = JSON.parse(getTraceResponse.toObject().traces).data;

      setData({ error: '', isLoading: false, trace: trace.length === 1 ? addColorForProcesses(trace)[0] : undefined });
    } catch (err) {
      setData({ error: err.message, isLoading: false, trace: undefined });
    }
  }, [name, traceID]);

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

  return (
    <React.Fragment>
      <Grid>
        <GridItem
          sm={12}
          md={12}
          lg={headerComponent ? 9 : 12}
          xl={headerComponent ? 9 : 12}
          xl2={headerComponent ? 9 : 12}
        >
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <Title className="pf-u-text-nowrap pf-u-text-truncate" headingLevel="h6" size="xl">
              {data.trace.processes[data.trace.spans[0].processID].serviceName}: {data.trace.spans[0].operationName}{' '}
              <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{data.trace.traceID}</span>
            </Title>
            <p>
              <span>
                <span className="pf-u-color-400">Trace Start: </span>
                <b className="pf-u-pr-md">{formatTraceTime(data.trace.spans[0].startTime)}</b>
              </span>
              <span>
                <span className="pf-u-color-400">Duration: </span>
                <b className="pf-u-pr-md">{getDuration(data.trace.spans)}ms</b>
              </span>
              <span>
                <span className="pf-u-color-400">Services: </span>
                <b className="pf-u-pr-md">{Object.keys(data.trace.processes).length}</b>
              </span>
              <span>
                <span className="pf-u-color-400">Total Spans: </span>
                <b className="pf-u-pr-md">{data.trace.spans.length}</b>
              </span>
            </p>
          </PageSection>
        </GridItem>

        {headerComponent ? (
          <GridItem
            sm={12}
            md={12}
            lg={headerComponent ? 3 : 12}
            xl={headerComponent ? 3 : 12}
            xl2={headerComponent ? 3 : 12}
          >
            <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
              {headerComponent}
            </PageSection>
          </GridItem>
        ) : null}

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
