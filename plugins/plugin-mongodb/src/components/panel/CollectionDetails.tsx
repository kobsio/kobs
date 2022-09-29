import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import React from 'react';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { ICollectionStatsData } from '../../utils/interfaces';
import { humanReadableSize } from '../../utils/helpers';

interface ICollectionDetailsProps {
  instance: IPluginInstance;
  collectionName: string;
}

const CollectionDetails: React.FunctionComponent<ICollectionDetailsProps> = ({
  instance,
  collectionName,
}: ICollectionDetailsProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<ICollectionStatsData, Error>(
    [`mongodb/collections/stats`, instance, collectionName],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections/stats?collectionName=${collectionName}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
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
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get collection details"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ICollectionStatsData, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <TableComposable aria-label="CollectionStats" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Metric</Th>
          <Th>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={2}>
            <Link to={`${pluginBasePath(instance)}/${collectionName}/query`}>Query Documents</Link>
          </Td>
        </Tr>
        <Tr>
          <Td>Namespace</Td>
          <Td>{data.ns}</Td>
        </Tr>
        <Tr>
          <Td>Total data size</Td>
          <Td>{humanReadableSize(data.size)}</Td>
        </Tr>
        <Tr>
          <Td>Number of documents</Td>
          <Td>{data.count}</Td>
        </Tr>
        <Tr>
          <Td>Average size of document</Td>
          <Td>{humanReadableSize(data.avgObjSize)}</Td>
        </Tr>
        <Tr>
          <Td>Number of orphaned documents</Td>
          <Td>{data.numOrphanDocs}</Td>
        </Tr>
        <Tr>
          <Td>Size of allocated document storage</Td>
          <Td>{humanReadableSize(data.storageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Size of reusable storage</Td>
          <Td>{humanReadableSize(data.freeStorageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Number of indexes</Td>
          <Td>{data.nindexes}</Td>
        </Tr>
        <Tr>
          <Td>Total size of indexes</Td>
          <Td>{humanReadableSize(data.totalIndexSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total size of collection</Td>
          <Td>{humanReadableSize(data.totalSize)}</Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

export default CollectionDetails;
