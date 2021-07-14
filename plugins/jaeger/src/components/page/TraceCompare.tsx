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
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { addColorForProcesses, getRootSpan } from '../../utils/helpers';
import { ITrace } from '../../utils/interfaces';
import Spans from '../panel/details/Spans';
import TraceActions from '../panel/details/TraceActions';
import TraceHeader from '../panel/details/TraceHeader';

interface ITraceCompareProps {
  name: string;
  traceID: string;
  trace?: ITrace;
}

const TraceCompare: React.FunctionComponent<ITraceCompareProps> = ({ name, traceID, trace }: ITraceCompareProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<ITrace, Error>(
    ['jaeger/trace', name, traceID, trace],
    async () => {
      try {
        if (trace && trace.traceID === traceID) {
          return addColorForProcesses([trace])[0];
        }

        const response = await fetch(`/api/plugins/jaeger/trace/${name}?traceID=${traceID}`, {
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return addColorForProcesses(json.data)[0];
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
    { keepPreviousData: true },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          title="Could not get trace"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<ITrace, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      </PageSection>
    );
  }

  if (!data) {
    return null;
  }

  const rootSpan = data && data.spans.length > 0 ? getRootSpan(data.spans) : undefined;
  if (!rootSpan) {
    return null;
  }

  return (
    <React.Fragment>
      <Grid>
        <GridItem sm={11} md={11} lg={11} xl={11} xl2={11}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <Title className="pf-u-text-nowrap pf-u-text-truncate" headingLevel="h6" size="xl">
              {data.processes[rootSpan.processID].serviceName}: {rootSpan.operationName}
              <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{data.traceID}</span>
            </Title>
            <p>
              <TraceHeader trace={data} rootSpan={rootSpan} />
            </p>
          </PageSection>
        </GridItem>

        <GridItem sm={1} md={1} lg={1} xl={1} xl2={1}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <div style={{ float: 'right', textAlign: 'right' }}>
              <TraceActions name={name} trace={data} />
            </div>
          </PageSection>
        </GridItem>

        <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
          <PageSection variant={PageSectionVariants.default}>
            <div style={{ position: 'relative' }}>
              <Spans name={name} trace={data} />
            </div>
          </PageSection>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

export default TraceCompare;
