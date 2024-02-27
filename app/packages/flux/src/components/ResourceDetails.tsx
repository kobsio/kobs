import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  IPluginInstance,
  pluginBasePath,
} from '@kobsio/core';
import { V1Condition } from '@kubernetes/client-node';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import ResourceActions from './ResourceActions';

import { IFluxResource, TFluxType } from '../utils/utils';

/**
 * `convertSourceKind` is used to convert the `kind` of a Flux CR to our internal `TFluxType`. This is required so that
 * we can navigate to a referenced Flux resource within the `ResourceDetails` drawer.
 */
const convertSourceKind = (kind?: string): TFluxType => {
  if (kind === 'GitRepository') {
    return 'gitrepositories';
  }

  if (kind === 'HelmRepository') {
    return 'helmrepositories';
  }

  if (kind === 'Bucket') {
    return 'buckets';
  }

  return 'gitrepositories';
};

/**
 * The `ResourceDetails` drawer is used to display a drawer with some details for each Flux resource. Depending on the
 * provided `fluxResource` different information will be displayed. It is also possible to access the actions for a
 * resource from the drawer.
 */
const ResourceDetails: FunctionComponent<{
  cluster: string;
  fluxResource: IFluxResource;
  instance: IPluginInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: () => void;
  open: boolean;
  path: string;
  refetch: () => void;
  resource: string;
}> = ({ instance, fluxResource, cluster, namespace, name, manifest, resource, path, refetch, onClose, open }) => {
  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={name}
      subtitle={namespace ? `(${cluster} / ${namespace})` : `(${cluster})`}
      actions={
        <ResourceActions
          instance={instance}
          fluxResource={fluxResource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          resource={resource}
          path={path}
          refetch={refetch}
        />
      }
    >
      {fluxResource.type === 'gitrepositories' ||
      fluxResource.type === 'buckets' ||
      fluxResource.type === 'helmrepositories' ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Info
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Type</DescriptionListTerm>
                <DescriptionListDescription>
                  {fluxResource.type === 'gitrepositories'
                    ? 'Git'
                    : fluxResource.type === 'helmrepositories'
                      ? 'Helm'
                      : fluxResource.type === 'buckets'
                        ? 'Bucket'
                        : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>URL</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.url ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Timeout</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.timeout ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Suspended</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.suspend ? 'True' : 'False'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      {fluxResource.type === 'kustomizations' ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Info
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Source</DescriptionListTerm>
                <DescriptionListDescription>
                  {manifest?.spec?.sourceRef ? (
                    <Link
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                      to={`${pluginBasePath(instance)}?type=${convertSourceKind(
                        manifest?.spec?.sourceRef?.kind,
                      )}&clusters[]=${cluster}&namespaces[]=${
                        manifest?.spec?.sourceRef?.namespace || namespace
                      }&paramName=fieldSelector&param=metadata.name=${manifest?.spec?.sourceRef?.name}`}
                    >
                      {manifest?.spec?.sourceRef?.kind} ({manifest?.spec?.sourceRef?.namespace || namespace})
                    </Link>
                  ) : (
                    '-'
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Namespace</DescriptionListTerm>
                <DescriptionListDescription>{namespace ? namespace : '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Path</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.path ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Interval</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.interval ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Prune</DescriptionListTerm>
                <DescriptionListDescription>
                  {manifest?.spec?.prune !== undefined ? (manifest?.spec?.prune ? 'True' : 'False') : '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Suspended</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.suspend ? 'True' : 'False'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Applied Revision</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.status?.lastAppliedRevision ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      {fluxResource.type === 'helmreleases' ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Info
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Interval</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.interval ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Chart</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.chart?.spec?.chart ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Version</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.chart?.spec?.version ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Suspended</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.suspend ? 'True' : 'False'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      {fluxResource.type === 'helmreleases' &&
      manifest &&
      manifest.spec &&
      manifest.spec.chart &&
      manifest.spec.chart.spec &&
      manifest.spec.chart.spec.sourceRef ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Source
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Source</DescriptionListTerm>
                <DescriptionListDescription>
                  {manifest?.spec?.chart?.spec?.sourceRef ? (
                    <Link
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                      to={`${pluginBasePath(instance)}?type=${convertSourceKind(
                        manifest?.spec?.chart?.spec?.sourceRef?.kind,
                      )}&clusters[]=${cluster}&namespaces[]=${
                        manifest?.spec?.chart?.spec?.sourceRef?.namespace || namespace
                      }&paramName=fieldSelector&param=metadata.name=${manifest?.spec?.chart?.spec?.sourceRef?.name}`}
                    >
                      {manifest?.spec?.chart?.spec?.sourceRef?.kind} (
                      {manifest?.spec?.chart?.spec?.sourceRef?.namespace || namespace})
                    </Link>
                  ) : (
                    '-'
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Kind</DescriptionListTerm>
                <DescriptionListDescription>
                  {manifest?.spec?.chart?.spec?.sourceRef?.kind ?? '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Namespace</DescriptionListTerm>
                <DescriptionListDescription>
                  {manifest?.spec?.chart?.spec?.sourceRef?.namespace ?? '-'}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      {fluxResource.type === 'gitrepositories' ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Git Reference
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Branch</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.ref?.branch ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Tag</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.ref?.tag ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>SemVer</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.ref?.semver ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Commit</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.spec?.ref?.commit ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      {manifest && manifest.status && manifest.status.artifact ? (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Artifact
            </Typography>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>Checksum</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.status?.artifact?.checksum ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Revision</DescriptionListTerm>
                <DescriptionListDescription>{manifest?.status?.artifact?.revision ?? '-'}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}

      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Typography variant="h6" pb={2}>
            Conditions
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(manifest?.status?.conditions as V1Condition[])?.map((condition, index) => (
                  <TableRow key={index}>
                    <TableCell>{condition.type}</TableCell>
                    <TableCell>{condition.status}</TableCell>
                    <TableCell>{condition.reason}</TableCell>
                    <TableCell>{condition.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </DetailsDrawer>
  );
};

export default ResourceDetails;
