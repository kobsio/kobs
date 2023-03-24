import {
  APIContext,
  APIError,
  fileDownload,
  IPluginPageProps,
  ITimes,
  Link,
  Page,
  Pagination,
  timeOptions,
  TTime,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { Description, PieChart } from '@mui/icons-material';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import LogsBucketChart, { IChangeTimeframePayload } from './LogsBucketChart';
import LogsDownload from './LogsDownload';
import LogsFieldsList from './LogsFieldsList';
import LogsTable from './LogsTable';
import LogsToolbar from './LogsToolbar';

import { ILogsData } from '../common/types';

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

const orderMapping = { asc: 'ascending', desc: 'descending' } as const;

/**
 * LogsPage displays the klogs plugin page that allows the user to search for logs
 * and compose a table with custom columns
 */
const LogsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const { client } = useContext(APIContext);
  const { search: rawSearch } = useLocation();
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

      const order = orderMapping[search.order];
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

  const handleChangeTime = ({ time, timeEnd, timeStart }: ITimes) => {
    setLastSeach(now());
    setSearch({
      time: time,
      ...(time === 'custom' ? { timeEnd, timeStart } : undefined),
    });
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

  const handleChangeSort = (orderBy: string) => {
    const isAsc = search.orderBy === orderBy && search.order === 'asc';
    setSearch({
      order: isAsc ? 'desc' : 'asc',
      orderBy: orderBy,
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
      description="Fast, scalable and reliable logging using Fluent Bit and ClickHouse."
      subtitle={instance.cluster}
      toolbar={
        <LogsToolbar
          {...search}
          handlers={{ onChangeTime: handleChangeTime, onSearch: handleSearch }}
          instance={instance}
        />
      }
      actions={
        <>
          <Tooltip title="Aggregation view">
            <IconButton component={Link} to={`./aggregation${rawSearch}`}>
              <PieChart />
            </IconButton>
          </Tooltip>
          <Tooltip title="Documentation">
            <IconButton component="a" href="https://kobs.io/main/plugins/klogs/" target="_blank">
              <Description />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <UseQueryWrapper
        {...queryResult}
        errorTitle="Failed to load applications"
        isNoData={!queryResult.data || queryResult.data.documents === null}
        noDataTitle="No logs found"
        noDataMessage="There were no logs found for your search query"
      >
        <Stack direction="row" spacing={2} sx={{ maxWidth: '100%' }}>
          <Paper>
            <LogsFieldsList
              selectedFields={search.fields}
              fields={queryResult.data?.fields || []}
              onToggleField={handleFieldToggle}
              onSwapItem={handleFieldSwap}
            />
          </Paper>
          <Stack direction="column" sx={{ width: '100%' }} spacing={2}>
            <Paper>
              <Stack direction="row" justifyContent="space-between" m={2}>
                <Typography fontWeight="medium">{`${queryResult.data?.count} documents in ${queryResult.data?.took} milliseconds`}</Typography>
                {queryResult.data?.documents && (
                  <LogsDownload rows={queryResult.data.documents} fields={search.fields} fileDownload={fileDownload} />
                )}
              </Stack>
              <Box sx={{ height: '150px' }}>
                <LogsBucketChart buckets={queryResult.data?.buckets || []} onChangeTimeframe={handleChangeTimeframe} />
              </Box>
            </Paper>
            <Paper>
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
                  onChangeSort: handleChangeSort,
                  onSelectField: handleFieldToggle,
                }}
              />
            </Paper>
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
