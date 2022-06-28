import { Alert, AlertActionLink, AlertVariant, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import ApplicationDetailsChart from './ApplicationDetailsChart';
import { IApplication } from '../../crds/application';
import { ITimes } from '@kobsio/shared';

interface IInsightProps {
  satellite?: string;
  cluster?: string;
  namespace?: string;
  name?: string;
  times: ITimes;
}

const Insights: React.FunctionComponent<IInsightProps> = ({
  satellite,
  cluster,
  namespace,
  name,
  times,
}: IInsightProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, Error>(
    ['app/applications/application', satellite, cluster, namespace, name],
    async () => {
      const response = await fetch(
        `/api/applications/application?id=${encodeURIComponent(
          `/satellite/${satellite}/cluster/${cluster}/namespace/${namespace}/name/${name}`,
        )}`,
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
        title="Could not get insights"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.insights || data.insights.length === 0) {
    return null;
  }

  return (
    <Flex direction={{ default: 'column' }}>
      {data.insights.map((insight, index) => (
        <FlexItem key={insight.title} style={index !== 0 ? { marginTop: '16px' } : undefined}>
          <ApplicationDetailsChart insight={insight} times={times} />
        </FlexItem>
      ))}
    </Flex>
  );
};

export default Insights;
