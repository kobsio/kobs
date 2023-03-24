import {
  APIContext,
  APIError,
  formatTimeString,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
} from '@kobsio/core';
import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import ReleaseDetails from './Release';

import { IRelease } from '../utils/utils';

/**
 * The `Release` component is used to render a single history entry in the history table. When a user selects a release
 * he can view the details of this release.
 */
const Release: FunctionComponent<{
  instance: IPluginInstance;
  release: IRelease;
  times: ITimes;
}> = ({ instance, release, times }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow
        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
        hover={true}
        selected={open}
        onClick={() => setOpen(true)}
      >
        <TableCell>{release.version || '-'}</TableCell>
        <TableCell>{release.info?.last_deployed ? formatTimeString(release.info.last_deployed) : '-'}</TableCell>
        <TableCell>{release.info?.status || '-'}</TableCell>
        <TableCell>{release.chart?.metadata?.version || '-'}</TableCell>
        <TableCell>{release.chart?.metadata?.appVersion || '-'}</TableCell>
      </TableRow>

      <ReleaseDetails instance={instance} release={release} times={times} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

/**
 * The `History` component is used to load and render a table with the history of the Helm release specified via the
 * `cluster`, `namespace` and `name` properties.
 */
const History: FunctionComponent<{
  cluster: string;
  instance: IPluginInstance;
  name: string;
  namespace: string;
  times: ITimes;
}> = ({ instance, cluster, namespace, name, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IRelease[], APIError>(
    ['helm/release/history', instance, cluster, namespace, name, times],
    async () => {
      return apiContext.client.get<IRelease[]>(
        `/api/plugins/helm/release/history?namespace=${namespace}&name=${name}`,
        {
          headers: {
            'x-kobs-cluster': cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load Helm releases"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No Helm releases were found"
      noDataMessage="No Helm releases were found for your selected filters."
      refetch={refetch}
    >
      <Card>
        {data && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Revision</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Chart</TableCell>
                  <TableCell>App Version</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((release) => (
                  <Release
                    key={`${release.cluster}-${release.namespace}-${release.name}`}
                    instance={instance}
                    release={release}
                    times={times}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </UseQueryWrapper>
  );
};

export default History;
