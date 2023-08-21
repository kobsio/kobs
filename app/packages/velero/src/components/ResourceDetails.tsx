import {
  APIContext,
  APIError,
  DetailsDrawer,
  Editor,
  IAPIContext,
  IPluginInstance,
  UseQueryWrapper,
} from '@kobsio/core';
import { Box, Card, CardContent, Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';
import { FunctionComponent, useContext, useState } from 'react';

import { IVeleroResource } from '../utils/utils';

const ResourceDetailsLogs: FunctionComponent<{
  cluster: string;
  instance: IPluginInstance;
  name: string;
  namespace: string;
  veleroResource: IVeleroResource;
}> = ({ instance, veleroResource, cluster, namespace, name }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<string, APIError>(
    ['velero/logs', instance, veleroResource, cluster, namespace, name],
    async () => {
      const result = await apiContext.client.get<string>(
        `/api/plugins/velero/logs?namespace=${namespace}&name=${name}&type=${veleroResource.type}`,
        {
          headers: {
            'x-kobs-cluster': cluster,
            'x-kobs-plugin': instance.name,
          },
          responseBodyFormat: 'text',
        },
      );

      return result;
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get logs"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="No logs were found"
      refetch={refetch}
    >
      {data ? (
        <Card>
          <CardContent style={{ overflowX: 'scroll', whiteSpace: 'pre', width: '100%' }}>{data}</CardContent>
        </Card>
      ) : null}
    </UseQueryWrapper>
  );
};

/**
 * The `ResourceDetails` drawer is used to display a drawer with some details for each Velero resource. Depending on the
 * provided `veleroResource` different information will be displayed. It is also possible to access the actions for a
 * resource from the drawer.
 */
const ResourceDetails: FunctionComponent<{
  cluster: string;
  instance: IPluginInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: () => void;
  open: boolean;
  path: string;
  refetch: () => void;
  resource: string;
  veleroResource: IVeleroResource;
}> = ({ instance, veleroResource, cluster, namespace, name, manifest, resource, path, refetch, onClose, open }) => {
  const [activeTab, setActiveTab] = useState<string>('yaml');

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={name}
      subtitle={namespace ? `(${cluster} / ${namespace})` : `(${cluster})`}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab key="yaml" label="Yaml" value="yaml" />
          <Tab key="logs" label="Logs" value="logs" />
        </Tabs>
      </Box>

      <Box key="yaml" hidden={activeTab !== 'yaml'} py={6}>
        {activeTab === 'yaml' && <Editor language="yaml" readOnly={true} value={yaml.dump(manifest)} />}
      </Box>

      <Box key="logs" hidden={activeTab !== 'logs'} py={6}>
        {activeTab === 'logs' && (
          <ResourceDetailsLogs
            instance={instance}
            veleroResource={veleroResource}
            cluster={cluster}
            namespace={namespace}
            name={name}
          />
        )}
      </Box>
    </DetailsDrawer>
  );
};

export default ResourceDetails;
