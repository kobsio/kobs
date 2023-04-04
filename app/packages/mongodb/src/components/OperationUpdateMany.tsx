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

export const OperationUpdateMany: FunctionComponent<{
  collectionName: string;
  description?: string;
  filter: string;
  instance: IPluginInstance;
  showActions?: boolean;
  times: ITimes;
  title: string;
  update: string;
}> = ({ instance, title, description, collectionName, filter, update, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<
    { matchedCount: number; modifiedCount: number },
    APIError
  >(['mongodb/operation/updatemany', instance, collectionName, filter, update, times], async () => {
    return apiContext.client.post<{ matchedCount: number; modifiedCount: number }>(
      `/api/plugins/mongodb/collections/updatemany?collectionName=${collectionName}`,
      {
        body: {
          filter: toExtendedJson(filter),
          update: toExtendedJson(update),
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      },
    );
  });

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
                )}/${collectionName}/query?operation=updateMany&filter=${encodeURIComponent(
                  filter,
                )}&update=${encodeURIComponent(update)}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to update documents"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data}
        noDataTitle="No documents were updated"
        refetch={refetch}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Matched Documents</TableCell>
                <TableCell>Modified Documents</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{data?.matchedCount ?? 0}</TableCell>
                <TableCell>{data?.modifiedCount ?? 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </UseQueryWrapper>
    </PluginPanel>
  );
};
