import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  pluginBasePath,
  PluginPanel,
  UseQueryWrapper,
} from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import { Document, EJSON } from 'bson';
import { FunctionComponent, useContext } from 'react';

import { Documents } from './Documents';
import { OperationActions } from './OperationActions';

import { toExtendedJson } from '../utils/utils';

export const OperationFind: FunctionComponent<{
  collectionName: string;
  description?: string;
  filter: string;
  instance: IPluginInstance;
  limit: number;
  showActions?: boolean;
  sort: string;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, collectionName, filter, sort, limit, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<Document[], APIError>(
    ['mongodb/operation/find', instance, collectionName, filter, sort, limit, times],
    async () => {
      const result = await apiContext.client.post<unknown[]>(
        `/api/plugins/mongodb/collections/find?collectionName=${collectionName}`,
        {
          body: {
            filter: toExtendedJson(filter),
            limit: limit,
            sort: toExtendedJson(sort),
          },
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (result) {
        return result.map((document: unknown) => EJSON.parse(JSON.stringify(document)));
      }

      return [];
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <OperationActions
          showActions={showActions}
          instance={instance}
          collectionName={collectionName}
          link={`${pluginBasePath(instance)}/${collectionName}/query?operation=find&filter=${encodeURIComponent(
            filter,
          )}&sort=${encodeURIComponent(sort)}&limit=${limit}`}
          documents={data}
        />
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load documents"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No documents were found"
        refetch={refetch}
      >
        <Documents instance={instance} collectionName={collectionName} documents={data ?? []} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
