import { Alert, AlertActionLink, AlertVariant, Card, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IResourceResponse } from '../utils/interfaces';
import ResourcesPanelTable from '../ResourcesPanelTable';

interface IEventsProps {
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
}

// Events is the component to display the events for a resource. The resource is identified by the cluster, namespace
// and name. The event must contain the involvedObject.name=<NAME> to be listed for a resource.
const Events: React.FunctionComponent<IEventsProps> = ({ satellite, cluster, namespace, name }: IEventsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse, Error>(
    ['app/resources/events', satellite, cluster, namespace, name],
    async () => {
      const namespaceID = `/satellite/${satellite}/cluster/${cluster}${namespace ? `/namespace/${namespace}` : ''}`;

      const response = await fetch(
        `/api/resources?namespaceID=${namespaceID}&resourceID=events&paramName=fieldSelector&param=involvedObject.name=${name}`,
        { method: 'get' },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        if (Array.isArray(json) && json.length === 1) {
          return json[0];
        }
      }

      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    },
  );

  return (
    <Card>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          {isLoading ? (
            <div className="pf-u-text-align-center">
              <Spinner />
            </div>
          ) : isError ? (
            <Alert
              variant={AlertVariant.danger}
              title="An error occured while events were fetched"
              actionLinks={
                <React.Fragment>
                  <AlertActionLink onClick={(): Promise<QueryObserverResult<IResourceResponse, Error>> => refetch()}>
                    Retry
                  </AlertActionLink>
                </React.Fragment>
              }
            >
              <p>{error?.message}</p>
            </Alert>
          ) : data ? (
            <div style={{ overflow: 'auto' }}>
              <ResourcesPanelTable resourceResponse={data} selectedRow={-1} />
            </div>
          ) : null}
        </FlexItem>
      </Flex>
    </Card>
  );
};

export default Events;
