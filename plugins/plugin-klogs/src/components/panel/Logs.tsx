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

import { ILogsData, IQuery } from '../../utils/interfaces';
import { IPluginInstance, ITimes } from '@kobsio/shared';
import LogsChart from './LogsChart';
import LogsDocuments from '../panel/LogsDocuments';

interface ILogsProps {
  instance: IPluginInstance;
  query: IQuery;
  times: ITimes;
}

const Logs: React.FunctionComponent<ILogsProps> = ({ instance, query, times }: ILogsProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<ILogsData, Error>(
    ['klogs/logs', instance, query, times],
    async () => {
      try {
        if (!query.query) {
          throw new Error('Query is missing');
        }

        const response = await fetch(
          `/api/plugins/klogs/logs?query=${encodeURIComponent(query.query)}&order=${
            query.order || ''
          }&orderBy=${encodeURIComponent(query.orderBy || '')}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
          if (json.error) {
            throw new Error(json.error);
          }

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
      keepPreviousData: true,
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
        isInline={true}
        title="Could not get logs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ILogsData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.documents || data.documents.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="icon" icon={InfoCircleIcon} />
        <Title headingLevel="h4" size="lg">
          No logs found
        </Title>
        <EmptyStateBody>
          We could not found any logs for the provided query: <code>{query.query}</code>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div>
      <LogsChart buckets={data.buckets} />
      <p>&nbsp;</p>

      <LogsDocuments documents={data.documents} fields={query.fields} order={query.order} orderBy={query.orderBy} />
    </div>
  );
};

export default Logs;
