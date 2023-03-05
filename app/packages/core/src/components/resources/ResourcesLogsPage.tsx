import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useEffect, useRef, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

interface IOptions {
  cluster: string;
  container: string;
  follow: boolean;
  name: string;
  namespace: string;
  previous: boolean;
  regex: string;
  since: number;
}

const ResourcesLogsPageStream: FunctionComponent<{ options: IOptions }> = ({ options }) => {
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setError('');

    const host = window.location.host.startsWith('localhost:')
      ? 'ws://localhost:15220'
      : `wss://${window.location.host}`;

    ws.current = new WebSocket(
      `${host}/api/resources/logs?x-kobs-cluster=${options.cluster}${
        options.namespace ? `&namespace=${options.namespace}` : ''
      }&name=${options.name}&container=${options.container}&since=${
        options.since
      }&tail=50000&previous=false&follow=true`,
    );

    ws.current.onmessage = (e) => {
      setLogs((prevLogs) => [...prevLogs, e.data]);
    };

    ws.current.onerror = () => {
      setError('An error occured while listining for new logs');
    };

    ws.current.onclose = () => {
      setError('Websocket connection was closed');
    };

    return () => ws.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      {error && (
        <Alert sx={{ mb: 4 }} severity="error">
          {error}
        </Alert>
      )}
      <Typography whiteSpace="pre-line">{logs.join('\n\r')}</Typography>;
    </Box>
  );
};

const ResourcesLogsPageFetch: FunctionComponent<{ options: IOptions }> = ({ options }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ logs: string }, APIError>(
    ['core/resources/resources/logs'],
    async () => {
      return apiContext.client.get<{ logs: string }>(
        `/api/resources/logs?namespace=${options.namespace}&name=${options.name}&container=${
          options.container
        }&regex=${encodeURIComponent(options.regex)}&since=${options.since}&tail=50000&previous=${
          options.previous
        }&follow=false`,
        {
          headers: {
            'x-kobs-cluster': options.cluster,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load logs"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.logs === '' || data.logs === '\n\r'}
      noDataTitle="No logs were found"
      noDataMessage="No logs were found for the selected container and pod."
      refetch={refetch}
    >
      <Typography whiteSpace="pre-line">{data?.logs}</Typography>
    </UseQueryWrapper>
  );
};

const ResourcesLogsPage: FunctionComponent = () => {
  const [options] = useQueryState<IOptions>({
    cluster: '',
    container: '',
    follow: false,
    name: '',
    namespace: '',
    previous: false,
    regex: '',
    since: 900,
  });

  return (
    <Page
      title={`${options.name} / ${options.container}`}
      subtitle={`(${options.cluster} / ${options.namespace})`}
      description={`View the logs of the ${options.container} container from the ${options.name} pod.`}
    >
      {options.follow ? <ResourcesLogsPageStream options={options} /> : <ResourcesLogsPageFetch options={options} />}
    </Page>
  );
};

export default ResourcesLogsPage;
