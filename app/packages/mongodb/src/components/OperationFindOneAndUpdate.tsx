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

export const OperationFindOneAndUpdate: FunctionComponent<{
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

  const { isError, isLoading, error, data, refetch } = useQuery<Document[], APIError>(
    ['mongodb/operation/findoneandupdate', instance, collectionName, filter, update, times],
    async () => {
      const result = await apiContext.client.post<unknown>(
        `/api/plugins/mongodb/collections/findoneandupdate?collectionName=${collectionName}`,
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

      if (result) {
        return [EJSON.parse(JSON.stringify(result))];
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
          link={`${pluginBasePath(
            instance,
          )}/${collectionName}/query?operation=findOneAndUpdate&filter=${encodeURIComponent(
            filter,
          )}&update=${encodeURIComponent(update)}`}
          documents={data}
        />
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to update document"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No document was updated"
        refetch={refetch}
      >
        <Documents instance={instance} collectionName={collectionName} documents={data ?? []} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
