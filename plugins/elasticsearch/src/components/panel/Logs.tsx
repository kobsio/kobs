import { Alert, AlertActionLink, AlertVariant, Button, ButtonVariant, Spinner } from '@patternfly/react-core';
import { InfiniteData, InfiniteQueryObserverResult, QueryObserverResult, useInfiniteQuery } from 'react-query';
import React from 'react';

import { IPluginTimes, PluginCard } from '@kobsio/plugin-core';
import { ILogsData } from '../../utils/interfaces';
import LogsActions from './LogsActions';
import LogsChart from '../panel/LogsChart';
import LogsDocuments from '../panel/LogsDocuments';

interface ILogsProps {
  name: string;
  title: string;
  description?: string;
  fields?: string[];
  query: string;
  showChart: boolean;
  times: IPluginTimes;
  showDetails?: (details: React.ReactNode) => void;
}

const Logs: React.FunctionComponent<ILogsProps> = ({
  name,
  title,
  description,
  fields,
  query,
  showChart,
  times,
  showDetails,
}: ILogsProps) => {
  const { isError, isFetching, isLoading, data, error, fetchNextPage, refetch } = useInfiniteQuery<ILogsData, Error>(
    ['elasticsearch/logs', query, times],
    async ({ pageParam }) => {
      try {
        const response = await fetch(
          `/api/plugins/elasticsearch/logs/${name}?query=${query}&timeStart=${times.timeStart}&timeEnd=${
            times.timeEnd
          }&scrollID=${pageParam || ''}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
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
    {
      getNextPageParam: (lastPage, pages) => lastPage.scrollID,
      keepPreviousData: true,
    },
  );

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<LogsActions name={name} query={query} fields={fields} times={times} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get logs"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<InfiniteData<ILogsData>, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.pages.length > 0 ? (
        <div>
          {showChart ? (
            <div>
              <LogsChart buckets={data.pages[0].buckets} />
              <p>&nbsp;</p>
            </div>
          ) : null}

          <LogsDocuments pages={data.pages} fields={fields} showDetails={showDetails} />
          <p>&nbsp;</p>

          {data.pages[0].documents.length > 0 ? (
            <Button
              variant={ButtonVariant.primary}
              isBlock={true}
              isDisabled={isFetching}
              isLoading={isFetching}
              onClick={(): Promise<InfiniteQueryObserverResult<ILogsData, Error>> => fetchNextPage()}
            >
              Load more
            </Button>
          ) : null}
        </div>
      ) : null}
    </PluginCard>
  );
};

export default Logs;
