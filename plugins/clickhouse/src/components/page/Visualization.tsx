import { Alert, AlertActionLink, AlertVariant, Card, CardBody, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { IVisualizationData, IVisualizationOptions } from '../../utils/interfaces';
import VisualizationChart from '../panel/VisualizationChart';

interface IVisualizationProps {
  name: string;
  options: IVisualizationOptions;
}

const Visualization: React.FunctionComponent<IVisualizationProps> = ({ name, options }: IVisualizationProps) => {
  const history = useHistory();

  const { isError, isLoading, data, error, refetch } = useQuery<IVisualizationData[], Error>(
    ['clickhouse/visualization', name, options],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/clickhouse/visualization/${name}?query=${encodeURIComponent(options.query)}&timeStart=${
            options.times.timeStart
          }&timeEnd=${options.times.timeEnd}&limit=${options.limit}&groupBy=${options.groupBy}&operation=${
            options.operation
          }&operationField=${options.operationField}&order=${options.order}`,
          {
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
        title="Could not get visualization data"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IVisualizationData[], Error>> => refetch()}>
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
    <Card isCompact={true} style={{ height: '100%' }}>
      <CardBody>
        <VisualizationChart chart={options.chart} operation={options.operation} data={data} />
      </CardBody>
    </Card>
  );
};

export default Visualization;
