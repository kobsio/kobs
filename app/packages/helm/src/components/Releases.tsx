import {
  APIContext,
  APIError,
  formatTimeString,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
} from '@kobsio/core';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import ReleaseDetails from './Release';

import { IRelease } from '../utils/utils';

/**
 * The `Release` component is used to render a single entry in the table of Helm releases. If a user clicks on a release
 * the details for the selected release will be shown.
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
        <TableCell>{release.name || '-'}</TableCell>
        <TableCell>{release.namespace || '-'}</TableCell>
        <TableCell>{release.cluster || '-'}</TableCell>
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
 * The `Releases` component is used to load a list of Helm releases for the provided `clusters` and `namespaces`. To get
 * the releases we have to make one API call for each cluster. The returned releases from our API will then be shown in
 * a table.
 */
const Releases: FunctionComponent<{
  clusters: string[];
  instance: IPluginInstance;
  namespaces: string[];
  times: ITimes;
}> = ({ instance, clusters, namespaces, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IRelease[], APIError>(
    ['helm/releases', instance, clusters, namespaces, times],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
      const n = join(namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));

      const releases: IRelease[] = [];
      for (const cluster of clusters) {
        const tmpReleases = await apiContext.client.get<IRelease[]>(`/api/plugins/helm/releases?${n}`, {
          headers: {
            'x-kobs-cluster': cluster,
          },
        });
        if (tmpReleases) {
          releases.push(...tmpReleases);
        }
      }
      return releases;
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
      <Paper>
        {data && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Namespace</TableCell>
                  <TableCell>Cluster</TableCell>
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
      </Paper>
    </UseQueryWrapper>
  );
};

export default Releases;
