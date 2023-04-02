import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  pluginBasePath,
  PluginPanel,
  PluginPanelActionLinks,
  UseQueryWrapper,
} from '@kobsio/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { toExtendedJson } from '../utils/utils';

export const OperationCount: FunctionComponent<{
  collectionName: string;
  description?: string;
  filter: string;
  instance: IPluginInstance;
  showActions?: boolean;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, collectionName, filter, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ count: number }, APIError>(
    ['mongodb/operation/count', instance, collectionName, filter, times],
    async () => {
      return apiContext.client.post<{ count: number }>(
        `/api/plugins/mongodb/collections/count?collectionName=${collectionName}`,
        {
          body: {
            filter: toExtendedJson(filter),
          },
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        showActions && (
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/${collectionName}/query?operation=count&filter=${encodeURIComponent(
                  filter,
                )}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load count"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data}
        noDataTitle="No count was found"
        refetch={refetch}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Documents</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{data?.count ?? 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </UseQueryWrapper>
    </PluginPanel>
  );
};
