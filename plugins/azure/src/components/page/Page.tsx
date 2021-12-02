import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { Route, Switch } from 'react-router-dom';
import React from 'react';

import ContainerInstancesPage from '../containerinstances/Page';
import { IPluginPageProps } from '@kobsio/plugin-core';
import KubernetesServicesPage from '../kubernetesservices/Page';
import OverviewPage from './OverviewPage';
import CostManagementPage from "../costmanagement/Page";

// IResourceGroup is the interface for a resource group returned by the Azure API. This interface is only required for
// the returned data, because we are only passing the name of the resource group to the other components.
interface IResourceGroup {
  id: string;
  location: string;
  name: string;
  type: string;
  tags: { [key: string]: string };
}

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<string[], Error>(
    ['azure/resourcegroups', name],
    async () => {
      try {
        const response = await fetch(`/api/plugins/azure/${name}/resourcegroups`, { method: 'get' });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json.map((resourceGroup: IResourceGroup) => resourceGroup.name);
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
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get resource groups"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<string[], Error>> => refetch()}>
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
    <Switch>
      <Route exact={true} path={`/${name}`}>
        <OverviewPage name={name} displayName={displayName} description={description} />
      </Route>
      <Route exact={true} path={`/${name}/containerinstances`}>
        <ContainerInstancesPage name={name} displayName={displayName} resourceGroups={data} />
      </Route>
      <Route exact={true} path={`/${name}/costmanagement`}>
        <CostManagementPage name={name} displayName={displayName} />
      </Route>
      <Route exact={true} path={`/${name}/kubernetesservices`}>
        <KubernetesServicesPage name={name} displayName={displayName} resourceGroups={data} />
      </Route>
    </Switch>
  );
};

export default Page;
