import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { IPluginPageProps } from '@kobsio/shared';

const ContainerInstancesPage = lazy(() => import('../containerinstances/Page'));
const CostManagementPage = lazy(() => import('../costmanagement/Page'));
const KubernetesServicesPage = lazy(() => import('../kubernetesservices/Page'));
const OverviewPage = lazy(() => import('./OverviewPage'));
const VirtualMachineScaleSetsPage = lazy(() => import('../virtualmachinescalesets/Page'));

// IResourceGroup is the interface for a resource group returned by the Azure API. This interface is only required for
// the returned data, because we are only passing the name of the resource group to the other components.
interface IResourceGroup {
  id: string;
  location: string;
  name: string;
  type: string;
  tags: { [key: string]: string };
}

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<string[], Error>(
    ['azure/resourcegroups', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/azure/resourcegroups`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
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
    <Suspense
      fallback={<Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />}
    >
      <Routes>
        <Route path="/" element={<OverviewPage instance={instance} />} />
        <Route
          path="/containerinstances"
          element={<ContainerInstancesPage instance={instance} resourceGroups={data} />}
        />
        <Route path="/costmanagement" element={<CostManagementPage instance={instance} resourceGroups={data} />} />
        <Route
          path="/kubernetesservices"
          element={<KubernetesServicesPage instance={instance} resourceGroups={data} />}
        />
        <Route
          path="/virtualmachinescalesets"
          element={<VirtualMachineScaleSetsPage instance={instance} resourceGroups={data} />}
        />
      </Routes>
    </Suspense>
  );
};

export default Page;
