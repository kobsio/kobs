import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import BsonPreview from '../page/BsonPreview';
import { toExtendedJson } from '../../utils/helpers';

interface ICountProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  collectionName: string;
  query: string;
}

const Count: React.FunctionComponent<ICountProps> = ({
  instance,
  title,
  description,
  collectionName,
  query,
}: ICountProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<{ count: number }, Error>(
    ['mongodb/collections/count', instance, collectionName, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections/count?collectionName=${collectionName}`, {
          body: toExtendedJson(query),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
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
    {
      keepPreviousData: true,
    },
  );

  if (isLoading) {
    return (
      <PluginPanel title={title} description={description}>
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      </PluginPanel>
    );
  }

  if (isError) {
    return (
      <PluginPanel title={title} description={description}>
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get query results"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<{ count: number }, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
          <p>
            <BsonPreview data={query} />
          </p>
        </Alert>
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <TableComposable aria-label="Documents count" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th>Documents</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{data?.count ?? 0}</Td>
          </Tr>
        </Tbody>
      </TableComposable>
    </PluginPanel>
  );
};

export default Count;
