import {
  Alert,
  AlertActionLink,
  AlertVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IQuery, ITrace } from '../../utils/interfaces';
import { encodeTags, transformTraceData } from '../../utils/helpers';
import TracesChart from './TracesChart';
import TracesList from './TracesList';
import { addColorForProcesses } from '../../utils/colors';

interface ITracesProps {
  instance: IPluginInstance;
  showChart: boolean;
  query: IQuery;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Traces: React.FunctionComponent<ITracesProps> = ({
  instance,
  times,
  setDetails,
  showChart,
  query,
}: ITracesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITrace[], Error>(
    ['jaeger/traces', instance, query, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/jaeger/traces?limit=${query.limit || '20'}&maxDuration=${query.maxDuration || ''}&minDuration=${
            query.minDuration || ''
          }&operation=${query.operation || ''}&service=${query.service || ''}&tags=${encodeTags(
            query.tags || '',
          )}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          const traceData = addColorForProcesses(json.data);
          const traces: ITrace[] = [];

          for (const trace of traceData) {
            const transformedTrace = transformTraceData(trace);
            if (transformedTrace) {
              traces.push(transformedTrace);
            }
          }

          return traces;
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
      <Alert
        variant={AlertVariant.danger}
        title="Could not get traces"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITrace[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="icon" icon={InfoCircleIcon} />
        <Title headingLevel="h4" size="lg">
          No traces found
        </Title>
        <EmptyStateBody>
          We could not found any traces for the selected service: <code>{query.service}</code>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <React.Fragment>
      {showChart ? (
        <React.Fragment>
          <TracesChart instance={instance} traces={data} setDetails={setDetails} />
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </React.Fragment>
      ) : null}

      <TracesList instance={instance} traces={data} setDetails={setDetails} />
    </React.Fragment>
  );
};

export default Traces;
