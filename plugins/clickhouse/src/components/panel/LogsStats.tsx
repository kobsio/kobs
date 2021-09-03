import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardHeaderMain,
  CardTitle,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ILogsStats } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import LogsChart from './LogsChart';

interface ILogsStatsProps {
  name: string;
  query: string;
  times: IPluginTimes;
  took: number;
  isFetchingDocuments: boolean;
  isPanel: boolean;
}

const LogsStats: React.FunctionComponent<ILogsStatsProps> = ({
  name,
  query,
  times,
  took,
  isFetchingDocuments,
  isPanel,
}: ILogsStatsProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<ILogsStats, Error>(
    ['clickhouse/logsstats', query, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/clickhouse/logs/stats/${name}?query=${encodeURIComponent(query)}&timeStart=${
            times.timeStart
          }&timeEnd=${times.timeEnd}`,
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
  );

  if (isPanel) {
    if (data && data.buckets) {
      return (
        <div>
          <LogsChart buckets={data.buckets} />
          <p>&nbsp;</p>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <Card isCompact={true}>
      <CardHeader>
        <CardHeaderMain>
          <CardTitle>
            {data && data.count ? data.count : 0} Documents in {took} Milliseconds
          </CardTitle>
        </CardHeaderMain>
        <CardActions>{isFetchingDocuments && <Spinner size="md" />}</CardActions>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get log stats"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ILogsStats, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <LogsChart buckets={data.buckets} />
        ) : null}
      </CardBody>
    </Card>
  );
};

export default LogsStats;
