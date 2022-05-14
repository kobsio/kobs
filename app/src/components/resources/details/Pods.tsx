import { Alert, AlertActionLink, AlertVariant, Card, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IResourceResponse } from '../utils/interfaces';
import ResourcesPanelTable from '../ResourcesPanelTable';

interface IPodsProps {
  satellite: string;
  cluster: string;
  namespace: string;
  paramName: string;
  param: string;
}

// Pods is the pods tab for various resources. It can be used to show the pods for a deployment, statefulset,
// etc. within the tabs.
const Pods: React.FunctionComponent<IPodsProps> = ({ satellite, cluster, namespace, paramName, param }: IPodsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse, Error>(
    ['app/resources/pods', satellite, cluster, namespace, paramName, param],
    async () => {
      const namespaceID = `/satellite/${satellite}/cluster/${cluster}${namespace ? `/namespace/${namespace}` : ''}`;

      const response = await fetch(
        `/api/resources?namespaceID=${namespaceID}&resourceID=pods&paramName=${paramName}&param=${param}`,
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

export default Pods;
