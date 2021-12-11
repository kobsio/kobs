import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import DetailsNodePools from './DetailsNodePools';
import { IManagedCluster } from './interfaces';

interface IDetailsNodePoolsWrapperProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsNodePoolsWrapper: React.FunctionComponent<IDetailsNodePoolsWrapperProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsNodePoolsWrapperProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IManagedCluster, Error>(
    ['azure/kubernetesservice/managedcluster/details', name, resourceGroup, managedCluster],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/kubernetesservices/managedcluster/details?resourceGroup=${resourceGroup}&managedCluster=${managedCluster}`,
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
        isInline={true}
        title="Could not get managed cluster details"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IManagedCluster, Error>> => refetch()}>
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
    <DetailsNodePools
      name={name}
      resourceGroup={resourceGroup}
      managedCluster={managedCluster}
      nodeResourceGroup={data.properties?.nodeResourceGroup}
    />
  );
};

export default DetailsNodePoolsWrapper;
