import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IOptions, ITrace } from '../../utils/interfaces';
import { addColorForProcesses, encodeTags } from '../../utils/helpers';
import { PluginCard } from '@kobsio/plugin-core';
import TracesActions from './TracesActions';
import TracesChart from './TracesChart';
import TracesList from './TracesList';

interface ITracesProps extends IOptions {
  name: string;
  title: string;
  description?: string;
  showDetails?: (details: React.ReactNode) => void;
  showChart: boolean;
}

const Traces: React.FunctionComponent<ITracesProps> = ({
  name,
  title,
  description,
  showDetails,
  showChart,
  limit,
  maxDuration,
  minDuration,
  operation,
  service,
  tags,
  times,
}: ITracesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITrace[], Error>(
    ['jaeger/traces', name, limit, maxDuration, minDuration, operation, service, tags, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/jaeger/traces/${name}?limit=${limit}&maxDuration=${maxDuration}&minDuration=${minDuration}&operation=${operation}&service=${service}&tags=${encodeTags(
            tags,
          )}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return addColorForProcesses(json.data);
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

  return (
    <PluginCard
      title={title}
      description={description}
      transparent={true}
      actions={
        <TracesActions
          name={name}
          limit={limit}
          maxDuration={maxDuration}
          minDuration={minDuration}
          operation={operation}
          service={service}
          tags={tags}
          times={times}
        />
      }
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
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
      ) : data && data.length > 0 ? (
        <React.Fragment>
          {showChart ? (
            <React.Fragment>
              <TracesChart traces={data} />
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
            </React.Fragment>
          ) : null}

          <TracesList name={name} traces={data} showDetails={showDetails} />
        </React.Fragment>
      ) : null}
    </PluginCard>
  );
};

export default Traces;
