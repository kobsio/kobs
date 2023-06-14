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

export const OperationFindOneAndDelete: FunctionComponent<{
  collectionName: string;
  description?: string;
  filter: string;
  instance: IPluginInstance;
  showActions?: boolean;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, collectionName, filter, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<Document[], APIError>(
    ['mongodb/operation/findoneanddelete', instance, collectionName, filter, times],
    async () => {
      const result = await apiContext.client.post<unknown>(
        `/api/plugins/mongodb/collections/findoneanddelete?collectionName=${collectionName}`,
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
          )}/${collectionName}/query?operation=findOneAndDelete&filter=${encodeURIComponent(filter)}`}
          documents={data}
        />
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to delete document"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No document was deleted"
        refetch={refetch}
      >
        <Documents instance={instance} collectionName={collectionName} documents={data ?? []} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
