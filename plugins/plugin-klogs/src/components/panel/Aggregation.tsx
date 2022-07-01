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
import { QueryObserverResult, useQuery } from 'react-query';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import React from 'react';

import { IAggregationData, IAggregationOptions } from '../../utils/interfaces';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import AggregationActions from './AggregationActions';
import AggregationChart from './AggregationChart';

interface IAggregationProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  options: IAggregationOptions;
}

const Aggregation: React.FunctionComponent<IAggregationProps> = ({
  instance,
  title,
  description,
  options,
}: IAggregationProps) => {
  const { isError, isFetching, isLoading, data, error, refetch } = useQuery<IAggregationData, Error>(
    ['klogs/aggregation', instance, options],
    async () => {
      try {
        const response = await fetch(`/api/plugins/klogs/aggregation`, {
          body: JSON.stringify(options),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
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
    <PluginPanel
      title={title}
      description={description}
      actions={<AggregationActions instance={instance} isFetching={isFetching} options={options} />}
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
      ) : (
        <EmptyState>
          <EmptyStateIcon variant="icon" icon={InfoCircleIcon} />
          <Title headingLevel="h4" size="lg">
            No logs found
          </Title>
          <EmptyStateBody>
            We could not found any data for the provided query: <code>{options.query}</code>
          </EmptyStateBody>
        </EmptyState>
      )}
    </PluginPanel>
  );
};

export default Aggregation;
