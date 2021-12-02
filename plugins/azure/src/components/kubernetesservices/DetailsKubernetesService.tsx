import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IManagedCluster } from './interfaces';

interface IDetailsKubernetesServiceProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsKubernetesService: React.FunctionComponent<IDetailsKubernetesServiceProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsKubernetesServiceProps) => {
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
    <div style={{ maxWidth: '100%', overflow: 'scroll' }}>
      <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.provisioningState || '-'} ({data.properties?.powerState?.code || '-'})
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>API Server Address</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.fqdn || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Kubernetes Version</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.kubernetesVersion || '-'}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>RBAC</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.enableRBAC ? 'Enabled' : 'Disabled'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>DNS Prefix</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.dnsPrefix || '-'}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Node Resource Group</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.nodeResourceGroup || '-'}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

export default DetailsKubernetesService;
