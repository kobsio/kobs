import { CardActions, CardHeader, CardHeaderMain, CardTitle, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import { ILogsCountData } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface ILogsHeaderProps {
  name: string;
  query: string;
  times: IPluginTimes;
  took: number;
  isFetchingDocuments: boolean;
}

const LogsHeader: React.FunctionComponent<ILogsHeaderProps> = ({
  name,
  query,
  times,
  took,
  isFetchingDocuments,
}: ILogsHeaderProps) => {
  const { data } = useQuery<ILogsCountData, Error>(['clickhouse/logscount', query, times], async () => {
    try {
      const response = await fetch(
        `/api/plugins/clickhouse/logs/count/${name}?query=${query}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
  });

  return (
    <CardHeader>
      <CardHeaderMain>
        <CardTitle>
          {data && data.count ? data.count : 0} Documents in {took} Milliseconds
        </CardTitle>
      </CardHeaderMain>
      <CardActions>{isFetchingDocuments && <Spinner size="md" />}</CardActions>
    </CardHeader>
  );
};

export default LogsHeader;
