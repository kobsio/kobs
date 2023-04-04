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

export const OperationDeleteMany: FunctionComponent<{
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
    ['mongodb/operation/deletemany', instance, collectionName, filter, times],
    async () => {
      return apiContext.client.post<{ count: number }>(
        `/api/plugins/mongodb/collections/deletemany?collectionName=${collectionName}`,
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
                link: `${pluginBasePath(
                  instance,
                )}/${collectionName}/query?operation=deleteMany&filter=${encodeURIComponent(filter)}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to delete documents"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data}
        noDataTitle="No documents were deleted"
        refetch={refetch}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Deleted Documents</TableCell>
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
