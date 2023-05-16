import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  Pagination,
  UseQueryWrapper,
  formatTimeString,
  DetailsDrawer,
} from '@kobsio/core';
import { ContentCopy, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Collapse,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';

import {
  IArtifact,
  IArtifactScanOverview,
  IArtifactsData,
  IBuildHistoryItem,
  IVulnerabilities,
  IVulnerabilityDetails,
} from '../utils/utils';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatVulnerabilities = (scanOverview: { [key: string]: IArtifactScanOverview }): React.ReactNode => {
  if (!scanOverview) {
    return <Chip color="default" size="small" sx={{ cursor: 'pointer' }} label="Vulnerabilities: -" />;
  }

  const keys = Object.keys(scanOverview);
  if (keys.length > 0) {
    if (scanOverview[keys[0]].scan_status === 'Success') {
      if (scanOverview[keys[0]].severity === 'Critical' || scanOverview[keys[0]].severity === 'High') {
        return (
          <Chip
            color="error"
            size="small"
            sx={{ cursor: 'pointer' }}
            label={`Vulnerabilities: ${scanOverview[keys[0]].severity}`}
          />
        );
      }

      if (scanOverview[keys[0]].severity === 'Medium') {
        return (
          <Chip
            color="warning"
            size="small"
            sx={{ cursor: 'pointer' }}
            label={`Vulnerabilities: ${scanOverview[keys[0]].severity}`}
          />
        );
      }

      return (
        <Chip
          color="success"
          size="small"
          sx={{ cursor: 'pointer' }}
          label={`Vulnerabilities: ${scanOverview[keys[0]].severity}`}
        />
      );
    }

    return (
      <Chip
        color="primary"
        size="small"
        sx={{ cursor: 'pointer' }}
        label={`Vulnerabilities: ${scanOverview[keys[0]].severity}`}
      />
    );
  }

  return <Chip color="default" size="small" sx={{ cursor: 'pointer' }} label="Vulnerabilities: -" />;
};

const formateVulnerability = (vulnerability: IVulnerabilityDetails): React.ReactNode | string => {
  if (vulnerability.links && vulnerability.links.length > 0) {
    return (
      <a
        style={{ color: 'inherit', textDecoration: 'inherit' }}
        href={vulnerability.links[0]}
        target="_blank"
        rel="noreferrer"
      >
        {vulnerability.id}
      </a>
    );
  }

  return vulnerability.id;
};

const formatSeverity = (severity: string): React.ReactNode => {
  if (severity === 'Critical' || severity === 'High') {
    return <Chip color="error" size="small" label={severity} />;
  } else if (severity === 'Medium') {
    return <Chip color="warning" size="small" label={severity} />;
  } else if (severity === 'Low') {
    return <Chip color="primary" size="small" label={severity} />;
  } else {
    return <Chip color="default" size="small" label={severity} />;
  }
};

const DetailsVulnerability: FunctionComponent<{
  vulnerability: IVulnerabilityDetails;
}> = ({ vulnerability }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow selected={open} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>{formateVulnerability(vulnerability)}</TableCell>
        <TableCell>{formatSeverity(vulnerability.severity)}</TableCell>
        <TableCell>{vulnerability.package}</TableCell>
        <TableCell>{vulnerability.version}</TableCell>
        <TableCell>{vulnerability.fix_version}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit={true}>
            {vulnerability.description}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const DetailsVulnerabilities: FunctionComponent<{
  artifactReference: string;
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
}> = ({ instance, projectName, repositoryName, artifactReference }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IVulnerabilities, APIError>(
    ['harbor/vulnerabilities', instance, projectName, repositoryName, artifactReference],
    async () => {
      return apiContext.client.get<IVulnerabilities>(
        `/api/plugins/harbor/vulnerabilities?projectName=${projectName}&repositoryName=${repositoryName}&artifactReference=${artifactReference}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <Card sx={{ mb: 6 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Vulnerabilities
        </Typography>

        <UseQueryWrapper
          error={error}
          errorTitle="Failed to load vulnerabilities"
          isError={isError}
          isLoading={isLoading}
          isNoData={!data || Object.keys(data).length === 0}
          noDataTitle="Vulnerabilities not found"
          refetch={refetch}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Vulnerability</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Current Version</TableCell>
                  <TableCell>Fixed in Version</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  ? Object.keys(data).map((key) =>
                      data[key].vulnerabilities.map((vulnerability) => (
                        <DetailsVulnerability key={`${key}-${vulnerability.id}`} vulnerability={vulnerability} />
                      )),
                    )
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </UseQueryWrapper>
      </CardContent>
    </Card>
  );
};

const DetailsBuildHistory: FunctionComponent<{
  artifactReference: string;
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
}> = ({ instance, projectName, repositoryName, artifactReference }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IBuildHistoryItem[], APIError>(
    ['harbor/buildhistory', instance, projectName, repositoryName, artifactReference],
    async () => {
      return apiContext.client.get<IBuildHistoryItem[]>(
        `/api/plugins/harbor/buildhistory?projectName=${projectName}&repositoryName=${repositoryName}&artifactReference=${artifactReference}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <Card sx={{ mb: 6 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Build History
        </Typography>

        <UseQueryWrapper
          error={error}
          errorTitle="Failed to load build history"
          isError={isError}
          isLoading={isLoading}
          isNoData={!data || data.length === 0}
          noDataTitle="Build history not found"
          refetch={refetch}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Created on</TableCell>
                  <TableCell>Command</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((buildHistoryItem, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {formatTimeString(buildHistoryItem.created)}
                    </TableCell>
                    <TableCell>
                      {buildHistoryItem.created_by.replace('/bin/sh -c #(nop) ', '').replace('/bin/sh -c ', '')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </UseQueryWrapper>
      </CardContent>
    </Card>
  );
};

const DetailsOverview: FunctionComponent<{ artifact: IArtifact }> = ({ artifact }) => {
  return (
    <Card sx={{ mb: 6 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Overview
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableBody>
              {artifact.extra_attrs.created && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Created</TableCell>
                  <TableCell>{formatTimeString(artifact.extra_attrs.created)}</TableCell>
                </TableRow>
              )}
              {artifact.size && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Size</TableCell>
                  <TableCell>{formatBytes(artifact.size)}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.author && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Author</TableCell>
                  <TableCell>{artifact.extra_attrs.author}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.architecture && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Architecture</TableCell>
                  <TableCell>{artifact.extra_attrs.architecture}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.os && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>OS</TableCell>
                  <TableCell>{artifact.extra_attrs.os}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.Cmd && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Cmd</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{artifact.extra_attrs.config.Cmd.join('\n')}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.Entrypoint && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Entrypoint</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    {artifact.extra_attrs.config.Entrypoint.join('\n')}
                  </TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.Env && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Env</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{artifact.extra_attrs.config.Env.join('\n')}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.ExposedPorts && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Ports</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    {Object.keys(artifact.extra_attrs.config.ExposedPorts).join('\n')}
                  </TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.Labels && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Labels</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                    {Object.keys(artifact.extra_attrs.config.Labels)
                      .map(
                        (key) =>
                          `${key}=${artifact.extra_attrs.config.Labels && artifact.extra_attrs.config.Labels[key]}`,
                      )
                      .join('\n')}
                  </TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.User && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>User</TableCell>
                  <TableCell>{artifact.extra_attrs.config.User}</TableCell>
                </TableRow>
              )}
              {artifact.extra_attrs.config.WorkingDir && (
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ verticalAlign: 'top' }}>Workind Dir</TableCell>
                  <TableCell>{artifact.extra_attrs.config.WorkingDir}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const Details: FunctionComponent<{
  artifact: IArtifact;
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  projectName: string;
  repositoryName: string;
}> = ({ instance, projectName, repositoryName, artifact, open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buildhistory' | 'vulnerabilities'>('overview');

  const copyPullCommand = (tag: string): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `docker pull ${
          instance.options && instance.options.address
            ? instance.options.address.replace('http://', '').replace('https://', '')
            : ''
        }/${projectName}/${decodeURIComponent(repositoryName)}:${tag}`,
      );
    }
  };

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={`${projectName}/${decodeURIComponent(repositoryName)}`}
      subtitle={artifact.tags ? artifact.tags.map((tag) => tag.name).join(', ') : artifact.digest}
    >
      {artifact.tags && (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Tags
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Push Time</TableCell>
                    <TableCell>Pull Time</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artifact.tags.map((tag) => (
                    <TableRow key={tag.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>{formatTimeString(tag.push_time)}</TableCell>
                      <TableCell>{formatTimeString(tag.pull_time)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => copyPullCommand(tag.name)}>
                          <ContentCopy />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Overview" value="overview" />
          <Tab label="Build History" value="buildhistory" />
          <Tab label="Vulnerabilities" value="vulnerabilities" />
        </Tabs>
      </Box>

      <Box hidden={activeTab !== 'overview'} sx={{ pt: 6 }}>
        {activeTab === 'overview' && <DetailsOverview artifact={artifact} />}
      </Box>
      <Box hidden={activeTab !== 'buildhistory'} sx={{ pt: 6 }}>
        {activeTab === 'buildhistory' && (
          <DetailsBuildHistory
            instance={instance}
            projectName={projectName}
            repositoryName={repositoryName}
            artifactReference={artifact.digest}
          />
        )}
      </Box>
      <Box hidden={activeTab !== 'vulnerabilities'} sx={{ pt: 6 }}>
        {activeTab === 'vulnerabilities' && (
          <DetailsVulnerabilities
            instance={instance}
            projectName={projectName}
            repositoryName={repositoryName}
            artifactReference={artifact.digest}
          />
        )}
      </Box>
    </DetailsDrawer>
  );
};

const Artifact: FunctionComponent<{
  artifact: IArtifact;
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
}> = ({ instance, projectName, repositoryName, artifact }) => {
  const [open, setOpen] = useState(false);

  /**
   * `hideDetails` sets the `open` state to `false`, which will hide the artifact details drawer.
   */
  const hideDetails = () => {
    setOpen(false);
  };

  /**
   * `showDetails` sets the `open` state to `true`, which will show the artifact details drawer.
   */
  const showDetails = () => {
    setOpen(true);
  };

  return (
    <>
      <ListItem onClick={showDetails} sx={{ cursor: 'pointer' }}>
        <ListItemText
          primary={
            <Typography variant="h6">
              {artifact.tags ? artifact.tags.map((tag) => tag.name).join(', ') : artifact.digest}
            </Typography>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
              <Chip
                color="default"
                size="small"
                sx={{ cursor: 'pointer' }}
                label={`Size: ${formatBytes(artifact.size)}`}
              />
              {formatVulnerabilities(artifact.scan_overview)}
              <Chip
                color="default"
                size="small"
                sx={{ cursor: 'pointer' }}
                label={`Push Time: ${formatTimeString(artifact.push_time)}`}
              />
              <Chip
                color="default"
                size="small"
                sx={{ cursor: 'pointer' }}
                label={`Pull Time: ${formatTimeString(artifact.pull_time)}`}
              />
              <Chip color="default" size="small" sx={{ cursor: 'pointer' }} label={`Digest: ${artifact.digest}`} />
            </Box>
          }
        />
      </ListItem>

      {open && (
        <Details
          instance={instance}
          projectName={projectName}
          repositoryName={repositoryName}
          artifact={artifact}
          onClose={hideDetails}
          open={open}
        />
      )}
    </>
  );
};

const Artifacts: FunctionComponent<{
  instance: IPluginInstance;
  projectName: string;
  query: string;
  repositoryName: string;
}> = ({ instance, projectName, query, repositoryName }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const { isError, isLoading, error, data, refetch } = useQuery<IArtifactsData, APIError>(
    ['harbor/artifacts', instance, projectName, repositoryName, query, page],
    async () => {
      return apiContext.client.get<IArtifactsData>(
        `/api/plugins/harbor/artifacts?projectName=${projectName}&repositoryName=${repositoryName}&query=${query}&page=${page.page}&pageSize=${page.perPage}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load artifacts"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.artifacts.length === 0}
      noDataTitle="No artifacts were found"
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data?.artifacts?.map((artifact, index) => (
          <Fragment key={artifact.id}>
            <Artifact
              instance={instance}
              projectName={projectName}
              repositoryName={repositoryName}
              artifact={artifact}
            />
            {index + 1 !== data?.artifacts?.length && <Divider component="li" />}
          </Fragment>
        ))}
      </List>

      <Pagination
        count={data?.total ?? 0}
        page={page.page ?? 1}
        perPage={page.perPage ?? 10}
        handleChange={(page, perPage) => setPage({ page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

export default Artifacts;
