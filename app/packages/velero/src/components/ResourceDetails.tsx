import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  Editor,
  IAPIContext,
  IPluginInstance,
  ToolbarItem,
  UseQueryWrapper,
  formatTimestamp,
} from '@kobsio/core';
import {
  Box,
  Card,
  CardContent,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
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
  const [view, setView] = useState<'table' | 'plain'>('table');

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
          <CardContent>
            <ToolbarItem>
              <ToggleButtonGroup
                sx={{ mb: 6 }}
                size="small"
                value={view}
                exclusive={true}
                onChange={(_, value) => setView(value)}
              >
                <ToggleButton sx={{ px: 4 }} value="table">
                  Table
                </ToggleButton>
                <ToggleButton sx={{ px: 4 }} value="plain">
                  Plain
                </ToggleButton>
              </ToggleButtonGroup>
            </ToolbarItem>

            {view === 'table' ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.split('\n').map((line, index) => {
                      if (line === '') {
                        return null;
                      }

                      const parsedLine = JSON.parse(line);

                      return (
                        <TableRow key={index}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatTimestamp(Math.floor(new Date(parsedLine.time).getTime() / 1000))}
                          </TableCell>
                          <TableCell>{parsedLine.level}</TableCell>
                          <TableCell>{parsedLine.msg}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <div style={{ overflowX: 'scroll', whiteSpace: 'pre', width: '100%' }}>{data}</div>
            )}
          </CardContent>
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
  const [activeTab, setActiveTab] = useState<string>('details');

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
          <Tab key="details" label="Details" value="details" />
          <Tab key="yaml" label="Yaml" value="yaml" />
          {veleroResource.type === 'backups' || veleroResource.type === 'restores' ? (
            <Tab key="logs" label="Logs" value="logs" />
          ) : null}
        </Tabs>
      </Box>

      <Box key="details" hidden={activeTab !== 'details'} py={6}>
        {activeTab === 'details' && (
          <>
            {veleroResource.type === 'backups' && (
              <Card sx={{ mb: 6 }}>
                <CardContent>
                  <Typography variant="h6" pb={2}>
                    Info
                  </Typography>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Status</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.phase ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Errors</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.errors ?? '0'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Warnings</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.warnings ?? '0'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Created</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.metadata?.creationTimestamp
                          ? formatTimestamp(Math.floor(new Date(manifest.metadata.creationTimestamp).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Expiration</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.status?.expiration
                          ? formatTimestamp(Math.floor(new Date(manifest.status.expiration).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Location</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.spec?.storageLocation ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    {manifest.status?.failureReason && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Failure</DescriptionListTerm>
                        <DescriptionListDescription>{manifest.status?.failureReason}</DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                  </DescriptionList>
                </CardContent>
              </Card>
            )}

            {veleroResource.type === 'restores' && (
              <Card sx={{ mb: 6 }}>
                <CardContent>
                  <Typography variant="h6" pb={2}>
                    Info
                  </Typography>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Backup</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.spec?.backupName ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Status</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.phase ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Errors</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.errors ?? '0'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Warnings</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.warnings ?? '0'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Started</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.status?.startTimestamp
                          ? formatTimestamp(Math.floor(new Date(manifest.status.startTimestamp).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Expiration</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.status?.expiration
                          ? formatTimestamp(Math.floor(new Date(manifest.status.expiration).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Created</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.metadata?.creationTimestamp
                          ? formatTimestamp(Math.floor(new Date(manifest.metadata.creationTimestamp).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    {manifest.status?.failureReason && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>Failure</DescriptionListTerm>
                        <DescriptionListDescription>{manifest.status?.failureReason}</DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                  </DescriptionList>
                </CardContent>
              </Card>
            )}

            {veleroResource.type === 'schedules' && (
              <Card sx={{ mb: 6 }}>
                <CardContent>
                  <Typography variant="h6" pb={2}>
                    Info
                  </Typography>
                  <DescriptionList>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Status</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.status?.phase ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Created</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.metadata?.creationTimestamp
                          ? formatTimestamp(Math.floor(new Date(manifest.metadata.creationTimestamp).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Schedule</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.spec?.schedule ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>TTL</DescriptionListTerm>
                      <DescriptionListDescription>{manifest.spec?.ttl ?? '-'}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Last Backup</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.status?.lastBackup
                          ? formatTimestamp(Math.floor(new Date(manifest.status.lastBackup).getTime() / 1000))
                          : '-'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Paused</DescriptionListTerm>
                      <DescriptionListDescription>
                        {manifest.spec?.paused === true ? 'True' : 'False'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </CardContent>
              </Card>
            )}
          </>
        )}
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
