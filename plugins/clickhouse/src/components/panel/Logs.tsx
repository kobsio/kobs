import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Spinner,
} from '@patternfly/react-core';
import { InfiniteData, InfiniteQueryObserverResult, QueryObserverResult, useInfiniteQuery } from 'react-query';
import React, { useState } from 'react';

import { ILogsData, IQuery } from '../../utils/interfaces';
import { IPluginTimes, PluginCard } from '@kobsio/plugin-core';
import LogsActions from './LogsActions';
import LogsChart from './LogsChart';
import LogsDocuments from '../panel/LogsDocuments';

interface ILogsProps {
  name: string;
  title: string;
  description?: string;
  queries: IQuery[];
  showChart: boolean;
  times: IPluginTimes;
  showDetails?: (details: React.ReactNode) => void;
}

const Logs: React.FunctionComponent<ILogsProps> = ({
  name,
  title,
  description,
  queries,
  showChart,
  times,
  showDetails,
}: ILogsProps) => {
  const [showSelect, setShowSelect] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<IQuery>(queries[0]);

  const { isError, isFetching, isLoading, data, error, fetchNextPage, refetch } = useInfiniteQuery<ILogsData, Error>(
    ['clickhouse/logs', selectedQuery, times],
    async ({ pageParam }) => {
      try {
        if (!selectedQuery.query) {
          throw new Error('Query is missing');
        }

        const response = await fetch(
          `/api/plugins/clickhouse/logs/${name}?query=${encodeURIComponent(selectedQuery.query)}&timeStart=${
            times.timeStart
          }&timeEnd=${times.timeEnd}&limit=100&offset=${pageParam || ''}`,
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
      getNextPageParam: (lastPage, pages) => lastPage.offset,
      keepPreviousData: true,
    },
  );

  const select = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    const query = queries.filter((query) => query.name === value);
    if (query.length === 1) {
      setSelectedQuery(query[0]);
    }
    setShowSelect(false);
  };

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<LogsActions name={name} queries={queries} times={times} />}
    >
      <div>
        {queries.length > 1 ? (
          <div>
            <Select
              variant={SelectVariant.single}
              typeAheadAriaLabel="Select query"
              placeholderText="Select query"
              onToggle={(): void => setShowSelect(!showSelect)}
              onSelect={select}
              selections={selectedQuery.name}
              isOpen={showSelect}
            >
              {queries.map((query, index) => (
                <SelectOption key={index} value={query.name} description={query.query} />
              ))}
            </Select>
            <p>&nbsp;</p>
          </div>
        ) : null}

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
                <AlertActionLink
                  onClick={(): Promise<QueryObserverResult<InfiniteData<ILogsData>, Error>> => refetch()}
                >
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

            <LogsDocuments pages={data.pages} fields={selectedQuery.fields} showDetails={showDetails} />
            <p>&nbsp;</p>

            {data.pages[0].documents && data.pages[0].documents.length > 0 ? (
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
      </div>
    </PluginCard>
  );
};

export default Logs;
