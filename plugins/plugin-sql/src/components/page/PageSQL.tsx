import { Alert, AlertActionLink, AlertVariant, Card, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';
import { ISQLData } from '../../utils/interfaces';
import SQLTable from '../panel/SQLTable';

interface IPageSQLProps {
  instance: IPluginInstance;
  query: string;
}

const PageSQL: React.FunctionComponent<IPageSQLProps> = ({ instance, query }: IPageSQLProps) => {
  const navigate = useNavigate();

  const { isError, isFetching, error, data, refetch } = useQuery<ISQLData, Error>(
    ['sql/query', instance, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/sql/query?query=${encodeURIComponent(query)}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
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
        title="Could not get query results"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
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

export default PageSQL;
