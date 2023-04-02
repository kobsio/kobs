import { APIContext, APIError, IAPIContext, IPluginInstance, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { humanReadableSize } from '../utils/utils';

interface IStatsData {
  avgObjSize: number;
  collections: string;
  dataSize: number;
  db: string;
  freeStorageSize: number;
  fsTotalSize: number;
  fsUsedSize: number;
  indexFreeStorageSize: number;
  indexSize: number;
  indexes: number;
  objects: number;
  scaleFactor: number;
  storageSize: number;
  totalFreeStorageSize: number;
  totalSize: number;
  views: number;
}

export const DBStats: FunctionComponent<{ description?: string; instance: IPluginInstance; title: string }> = ({
  instance,
  title,
  description,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IStatsData, APIError>(
    ['mongodb/stats', instance],
    async () => {
      return apiContext.client.get<IStatsData>(`/api/plugins/mongodb/stats`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load database statistics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data}
        noDataTitle="No database statistics were found"
        refetch={refetch}
      >
        {data && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Database name</TableCell>
                  <TableCell>{data.db}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Number of collections</TableCell>
                  <TableCell>{data.collections}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Number of views</TableCell>
                  <TableCell>{data.views}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Number of objects</TableCell>
                  <TableCell>{data.objects}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average object size</TableCell>
                  <TableCell>{humanReadableSize(data.avgObjSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total data size</TableCell>
                  <TableCell>{humanReadableSize(data.dataSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total allocated storage size</TableCell>
                  <TableCell>{humanReadableSize(data.storageSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total free storage size</TableCell>
                  <TableCell>{humanReadableSize(data.freeStorageSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Number of indexes</TableCell>
                  <TableCell>{data.indexes}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total index size</TableCell>
                  <TableCell>{humanReadableSize(data.indexSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total free index size</TableCell>
                  <TableCell>{humanReadableSize(data.indexFreeStorageSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total size (indices + data)</TableCell>
                  <TableCell>{humanReadableSize(data.totalSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total free size</TableCell>
                  <TableCell>{humanReadableSize(data.totalFreeStorageSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total used filesystem size</TableCell>
                  <TableCell>{humanReadableSize(data.fsUsedSize)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total filesystem size</TableCell>
                  <TableCell>{humanReadableSize(data.fsTotalSize)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </UseQueryWrapper>
    </PluginPanel>
  );
};
