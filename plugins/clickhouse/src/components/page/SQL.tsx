import { Alert, AlertActionLink, AlertVariant, Card, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ISQLData } from '../../utils/interfaces';
import SQLTable from '../panel/SQLTable';

interface ISQLProps {
  name: string;
  query: string;
}

const SQL: React.FunctionComponent<ISQLProps> = ({ name, query }: ISQLProps) => {
  const history = useHistory();

  const { isError, isFetching, error, data, refetch } = useQuery<ISQLData, Error>(
    ['clickhouse/sql', query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/clickhouse/sql/${name}?query=${encodeURIComponent(query)}`, {
          method: 'get',
        });
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

  if (isFetching) {
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
        title="Could not get result for SQL query"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ISQLData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card isCompact={true} style={{ maxWidth: '100%', overflowX: 'scroll' }}>
      <SQLTable columns={data.columns} rows={data.rows} />
    </Card>
  );
};

export default SQL;
