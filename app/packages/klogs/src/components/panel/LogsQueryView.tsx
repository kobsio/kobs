import { APIContext, APIError, timeOptions, ITimes, UseQueryWrapper, IPluginInstance, Pagination } from '@kobsio/core';
import { Card, Stack, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import { IQuery } from './LogsPanel';

import { ILogsData } from '../common/types';
import LogsBucketChart, { IChangeTimeframePayload } from '../page/LogsBucketChart';
import LogsTable from '../page/LogsTable';

const now = () => Math.floor(Date.now() / 1000);

const noopHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onAddFilter: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChangeSort: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSelectField: () => {},
};

interface ILogsQueryViewProps {
  instance: IPluginInstance;
  query: IQuery;
  setTimes: (times: ITimes) => void;
  times: ITimes;
}

/**
 * LogsQueryView renders the results of a query in a table format
 * the component includes a bar chart for navigating the logs time-series
 */
const LogsQueryView: FunctionComponent<ILogsQueryViewProps> = ({ instance, query, setTimes, times }) => {
  const order = 'desc';
  const orderBy = 'timestamp';
  const { client } = useContext(APIContext);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  const queryResult = useQuery<ILogsData, APIError>([times], () => {
    let timeEnd: number, timeStart;
    if (times.time === 'custom') {
      timeEnd = times.timeEnd;
      timeStart = times.timeStart;
    } else {
      timeEnd = now();
      timeStart = now() - timeOptions[times.time].seconds;
    }

    const path = `/api/plugins/klogs/logs?query=${query.query}&order=${order}&orderBy=${orderBy}&timeStart=${timeStart}&timeEnd=${timeEnd}`;
    return client.get<ILogsData>(path, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  const handleChangeTimeframe = (payload: IChangeTimeframePayload) => {
    setTimes({
      time: 'custom',
      timeEnd: payload.timeEnd,
      timeStart: payload.timeStart,
    });
  };

  return (
    <UseQueryWrapper
      {...queryResult}
      errorTitle="Failed to load applications"
      isNoData={!queryResult.data || queryResult.data.documents === null}
      noDataTitle="No logs found"
      noDataMessage="There were no logs found for your search query"
    >
      <Stack direction="column" sx={{ width: '100%' }} spacing={2}>
        <Stack direction="row" justifyContent="space-between" m={2}>
          <Typography fontWeight="medium">{`${queryResult.data?.count} documents in ${queryResult.data?.took} milliseconds`}</Typography>
        </Stack>
        <Box sx={{ height: '250px' }}>
          <LogsBucketChart buckets={queryResult.data?.buckets || []} onChangeTimeframe={handleChangeTimeframe} />
        </Box>
        <Card>
          <LogsTable
            fields={query.fields || []}
            options={{ hideActionColumn: true }}
            order={order}
            orderBy={orderBy}
            rows={((rows) => rows.slice((page - 1) * perPage, page * perPage))(queryResult?.data?.documents || [])}
            handlers={noopHandlers}
          />
        </Card>
        <Pagination
          count={queryResult.data?.documents?.length ?? 0}
          page={page ?? 1}
          perPage={perPage}
          handleChange={(page, perPage) => {
            setPage(page);
            setPerPage(perPage);
          }}
        />
      </Stack>
    </UseQueryWrapper>
  );
};

export default LogsQueryView;
