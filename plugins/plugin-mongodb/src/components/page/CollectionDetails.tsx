import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { ICollectionStatsData } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import React from 'react';
import { humanReadableSize } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface ICollectionItemProps {
  instance: IPluginInstance;
  collectionName: string;
}

const CollectionDetails: React.FunctionComponent<ICollectionItemProps> = ({
  instance,
  collectionName,
}: ICollectionItemProps) => {
  const navigate = useNavigate();
  const { isError, isLoading, data, error, refetch } = useQuery<ICollectionStatsData, Error>(
    [`mongodb/collections/${collectionName}/stats`, instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections/${collectionName}/stats`, {
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
          if (json.error) {
            throw new Error(json.error);
          }

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
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
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
          <Th tooltip={null}>Metric</Th>
          <Th tooltip={null}>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
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
