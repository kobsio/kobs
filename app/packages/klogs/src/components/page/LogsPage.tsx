import {
  APIContext,
  APIError,
  fileDownload,
  IPluginPageProps,
  Page,
  Pagination,
  timeOptions,
  TTime,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { Box, Card, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { useState } from 'react';

import LogsBucketChart, { IChangeTimeframePayload } from './LogsBucketChart';
import LogsDownload from './LogsDownload';
import LogsFieldsList from './LogsFieldsList';
import LogsPageActions from './LogsPageActions';
import LogsTable from './LogsTable';
import LogsToolbar, { IOptions } from './LogsToolbar';

import { ILogsData } from '../common/types';
import { orderMapping } from '../utils/order';

export interface ISearch {
  fields: string[];
  order: 'asc' | 'desc';
  orderBy: string;
  page: number;
  perPage: number;
  query: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

// now in seconds
export const now = () => Math.floor(Date.now() / 1000);

export const defaultSearch: ISearch = {
  fields: [],
  order: 'desc',
  orderBy: 'timestamp',
  page: 1,
  perPage: 100,
  query: '',
  time: 'last15Minutes',
  timeEnd: now(),
  timeStart: now() - 900,
};

const defaultDescription = 'Fast, scalable and reliable logging using Fluent Bit and ClickHouse.';

/**
 * LogsPage displays the klogs plugin page that allows the user to search for logs
 * and compose a table with custom columns
 */
const LogsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const { client } = useContext(APIContext);
  const [search, setSearch] = useQueryState<ISearch>(defaultSearch);
  // lastSearch is required, to enable reloading of log results
  // when the user has selected one of the quick time-range options
  const [lastSearch, setLastSeach] = useState(now());
  const queryResult = useQuery<ILogsData, APIError>(
    [search.query, search.time, search.timeEnd, search.timeStart, search.order, search.orderBy, lastSearch],
    () => {
      let timeEnd: number, timeStart: number;
      if (search.time === 'custom') {
        timeEnd = search.timeEnd;
        timeStart = search.timeStart;
      } else {
        timeEnd = now();
        timeStart = now() - timeOptions[search.time].seconds;
      }

      const order = orderMapping.shortToLong[search.order];
      const path = `/api/plugins/klogs/logs?query=${search.query}&order=${order}&orderBy=${search.orderBy}&timeStart=${timeStart}&timeEnd=${timeEnd}`;
      return client.get<ILogsData>(path, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  const handleSearch = (query: string) => {
    return setSearch({ fields: search.fields, query: query });
  };

  const handleChangeTimeframe = (payload: IChangeTimeframePayload) => {
    setSearch({ page: 1, time: 'custom', timeEnd: payload.timeEnd, timeStart: payload.timeStart });
  };

  const handleAddFilter = (filter: string) => {
    const parts = [];
    if (search.query) {
      parts.push(search.query);
      parts.push('_and_');
    }
    parts.push(filter);
    handleSearch(parts.join(' '));
  };

  const handleToggleSort = (orderBy: string) => {
    const isAsc = search.orderBy === orderBy && search.order === 'asc';
    setSearch({
      order: isAsc ? 'desc' : 'asc',
      orderBy: orderBy,
    });
  };

  const handleChangeOptions = ({ time, timeEnd, timeStart, order, orderBy }: IOptions) => {
    setLastSeach(now());
    setSearch({
      order: order,
      orderBy: orderBy,
      ...(time === 'custom' ? { timeEnd, timeStart } : undefined),
      time: time,
    });
  };

  const handleFieldToggle = (field: string) => {
    const i = search.fields.indexOf(field);

    if (i === -1) {
      return setSearch({ fields: [...search.fields, field] });
    }

    return setSearch({ fields: [...search.fields.slice(0, i), ...search.fields.slice(i + 1)] });
  };

  const handleFieldSwap = (from: number, to: number) => {
    setSearch({
      fields: [
        ...search.fields.slice(0, from),
        search.fields[to],
        ...search.fields.slice(from + 1, to),
        search.fields[from],
        ...search.fields.slice(to + 1),
      ],
    });
  };

  return (
    <Page
      title="klogs"
      description={instance.description || defaultDescription}
      subtitle={instance.cluster}
      toolbar={
        <LogsToolbar
          instance={instance}
          onChangeOptions={handleChangeOptions}
          onSearch={handleSearch}
          order={search.order}
          orderBy={search.orderBy}
          query={search.query}
          time={search.time}
          timeEnd={search.timeEnd}
          timeStart={search.timeStart}
        />
      }
      actions={<LogsPageActions />}
    >
      <UseQueryWrapper
        error={queryResult.error}
        isError={queryResult.isError}
        isLoading={queryResult.isLoading}
        refetch={queryResult.refetch}
        errorTitle="Could not get log"
        isNoData={!queryResult.data || queryResult.data.documents === null}
        noDataTitle="No logs found"
        noDataMessage="There were no logs found for your search query"
      >
        <Stack alignItems="flex-start" direction="row" spacing={2} sx={{ maxWidth: '100%' }}>
          <Card sx={{ width: '250px' }}>
            <LogsFieldsList
              selectedFields={search.fields}
              fields={queryResult.data?.fields || []}
              onToggleField={handleFieldToggle}
              onSwapItem={handleFieldSwap}
            />
          </Card>
          <Stack direction="column" sx={{ width: '100%' }} spacing={2}>
            <Card>
              <Stack direction="row" justifyContent="space-between" m={2}>
                <Typography fontWeight="medium">{`${queryResult.data?.count} documents in ${queryResult.data?.took} milliseconds`}</Typography>
                {queryResult.data?.documents && (
                  <LogsDownload rows={queryResult.data.documents} fields={search.fields} fileDownload={fileDownload} />
                )}
              </Stack>
              <Box sx={{ height: '250px' }}>
                <LogsBucketChart buckets={queryResult.data?.buckets || []} onChangeTimeframe={handleChangeTimeframe} />
              </Box>
            </Card>
            <Card sx={{ pb: 4 }}>
              <LogsTable
                fields={search.fields}
                order={search.order}
                orderBy={search.orderBy}
                options={{ hideActionColumn: false }}
                rows={((rows) => rows.slice((search.page - 1) * search.perPage, search.page * search.perPage))(
                  queryResult?.data?.documents || [],
                )}
                handlers={{
                  onAddFilter: handleAddFilter,
                  onChangeSort: handleToggleSort,
                  onSelectField: handleFieldToggle,
                }}
              />
            </Card>
            <Pagination
              count={queryResult.data?.documents?.length ?? 0}
              page={search.page ?? 1}
              perPage={search.perPage ?? 100}
              handleChange={(page, perPage) => setSearch({ page: page, perPage: perPage })}
            />
          </Stack>
        </Stack>
      </UseQueryWrapper>
    </Page>
  );
};

export default LogsPage;
