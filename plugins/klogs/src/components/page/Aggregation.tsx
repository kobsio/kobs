import { Alert, AlertActionLink, AlertVariant, Card, CardBody, CardHeader, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { IAggregationData, IAggregationOptions } from '../../utils/interfaces';
import AggregationActions from './AggregationActions';
import AggregationChart from '../panel/AggregationChart';

interface IAggregationProps {
  name: string;
  options: IAggregationOptions;
}

const Aggregation: React.FunctionComponent<IAggregationProps> = ({ name, options }: IAggregationProps) => {
  const history = useHistory();

  const { isError, isFetching, isLoading, data, error, refetch } = useQuery<IAggregationData, Error>(
    ['klogs/aggregation', name, options],
    async () => {
      try {
        const response = await fetch(`/api/plugins/klogs/${name}/aggregation`, {
          body: JSON.stringify(options),
          method: 'post',
        });
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
        title="Could not get aggregation data"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IAggregationData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.rows || !data.columns) {
    return null;
  }

  return (
    <Card isCompact={true} style={{ height: '100%' }}>
      <CardHeader>
        <AggregationActions
          name={name}
          query={options.query}
          times={options.times}
          data={data}
          isFetching={isFetching}
        />
      </CardHeader>
      <CardBody>
        <AggregationChart minHeight={500} options={options} data={data} />
      </CardBody>
    </Card>
  );
};

export default Aggregation;
