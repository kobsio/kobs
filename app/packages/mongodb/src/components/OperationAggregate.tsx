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

/**
 * The `OperationAggregate` component is used to load the results for a user provided aggregate pipeline, e.g.
 *
 * ```
 * [
 *   {
 *     $group: {
 *       "_id": [
 *         {"name": "$name"},
 *         {"namespace": "$namespace"}
 *       ],
 *       "clusters": {$push: "$cluster"},
 *       "namespaces": {$push: "$namespace"},
 *       "names": {$push: "$name"},
 *     }
 *   }
 * ]
 * ```
 */
export const OperationAggregate: FunctionComponent<{
  collectionName: string;
  description?: string;
  instance: IPluginInstance;
  pipeline: string;
  showActions?: boolean;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, collectionName, pipeline, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<Document[], APIError>(
    ['mongodb/operation/aggregate', instance, collectionName, pipeline, times],
    async () => {
      const result = await apiContext.client.post<unknown[]>(
        `/api/plugins/mongodb/collections/aggregate?collectionName=${collectionName}`,
        {
          body: {
            pipeline: toExtendedJson(pipeline),
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
          link={`${pluginBasePath(instance)}/${collectionName}/query?operation=aggregate&pipeline=${encodeURIComponent(
            pipeline,
          )}`}
          documents={data}
        />
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to run aggregation"
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
