import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { IStatsData } from '../../utils/interfaces';
import { humanReadableSize } from '../../utils/helpers';

interface IDBStatsProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
}

const DBStats: React.FunctionComponent<IDBStatsProps> = ({ instance, title, description }: IDBStatsProps) => {
  const { isError, isLoading, data, error, refetch } = useQuery<IStatsData, Error>(
    ['mongodb/dbstats', instance],
    async () => {
      try {
        const response = await fetch(`/api/plugins/mongodb/stats`, {
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
          title="Could not get database statistics"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IStatsData, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <TableComposable aria-label="DatabaseStats" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th>Metric</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Database name</Td>
            <Td>{data.db}</Td>
          </Tr>
          <Tr>
            <Td>Number of collections</Td>
            <Td>{data.collections}</Td>
          </Tr>
          <Tr>
            <Td>Number of views</Td>
            <Td>{data.views}</Td>
          </Tr>
          <Tr>
            <Td>Number of objects</Td>
            <Td>{data.objects}</Td>
          </Tr>
          <Tr>
            <Td>Average object size</Td>
            <Td>{humanReadableSize(data.avgObjSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total data size</Td>
            <Td>{humanReadableSize(data.dataSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total allocated storage size</Td>
            <Td>{humanReadableSize(data.storageSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total free storage size</Td>
            <Td>{humanReadableSize(data.freeStorageSize)}</Td>
          </Tr>
          <Tr>
            <Td>Number of indexes</Td>
            <Td>{data.indexes}</Td>
          </Tr>
          <Tr>
            <Td>Total index size</Td>
            <Td>{humanReadableSize(data.indexSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total free index size</Td>
            <Td>{humanReadableSize(data.indexFreeStorageSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total size (indices + data)</Td>
            <Td>{humanReadableSize(data.totalSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total free size</Td>
            <Td>{humanReadableSize(data.totalFreeStorageSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total used filesystem size</Td>
            <Td>{humanReadableSize(data.fsUsedSize)}</Td>
          </Tr>
          <Tr>
            <Td>Total filesystem size</Td>
            <Td>{humanReadableSize(data.fsTotalSize)}</Td>
          </Tr>
        </Tbody>
      </TableComposable>
    </PluginPanel>
  );
};

export default DBStats;
