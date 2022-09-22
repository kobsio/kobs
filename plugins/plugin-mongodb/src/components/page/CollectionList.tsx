import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import CollectionItem from './CollectionItem';
import { IPluginInstance } from '@kobsio/shared';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ICollectionListProps {
  instance: IPluginInstance;
}

const CollectionList: React.FunctionComponent<ICollectionListProps> = ({ instance }: ICollectionListProps) => {
  const navigate = useNavigate();
  const { isError, isLoading, data, error, refetch } = useQuery<string[], Error>(
    ['mongodb/collections', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/collections`, {
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
        title="Could not get database collections"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<string[], Error>> => refetch()}>
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
    <TableComposable aria-label="collections" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th />
          <Th tooltip={null}>Collection Name</Th>
          <Th />
        </Tr>
      </Thead>
      {data.map((name, idx) => (
        <CollectionItem key={name} instance={instance} collectionName={name} />
      ))}
    </TableComposable>
  );
};

export default CollectionList;
