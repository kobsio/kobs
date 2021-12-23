import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IAggregationData, IAggregationOptions } from '../../utils/interfaces';
import AggregationActions from './AggregationActions';
import AggregationChart from './AggregationChart';
import { PluginCard } from '@kobsio/plugin-core';

interface IAggregationProps {
  name: string;
  title: string;
  description?: string;
  options: IAggregationOptions;
}

const Aggregation: React.FunctionComponent<IAggregationProps> = ({
  name,
  title,
  description,
  options,
}: IAggregationProps) => {
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

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<AggregationActions name={name} isFetching={isFetching} options={options} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get aggregation data"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IAggregationData, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.rows && data.columns ? (
        <AggregationChart minHeight={0} options={options} data={data} />
      ) : null}
    </PluginCard>
  );
};

export default Aggregation;
