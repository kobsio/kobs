import {
  Alert,
  AlertTitle,
  Button,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Box,
  Card,
} from '@mui/material';
import { useQuery, QueryObserverResult } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import ResourceActions from './ResourceActions';
import ResourceDetails from './ResourceDetails';
import { customResourceDefinitionTemplate, IRow, templates } from './template';
import { IDashboard, IOptions, IOptionsColumn, IResource, IResourceResponse } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { ITimes } from '../../utils/times';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

/**
 * `getErrors` returns all errors which were thrown in the API call for a specifc cluster or namespace. This is required
 * because we do not throw a error when the call to get the resources only fails for one selected namespace.
 */
const getErrors = (resource: IResourceResponse): string[] => {
  const errors: string[] = [];

  if (resource.clusters) {
    for (const cluster of resource.clusters) {
      if (cluster.error) {
        errors.push(cluster.error);
      }

      if (cluster.namespaces) {
        for (const namespace of cluster.namespaces) {
          if (namespace.error) {
            errors.push(namespace.error);
          }
        }
      }
    }
  }

  return errors;
};

/**
 * `IResourceRowProps` is the interface for the `ResourceRow` component.
 */
interface IResourceRowProps {
  dashboards?: IDashboard[];
  refetch: () => void;
  resource: IResource;
  row: IRow;
}

/**
 * The `ResourceRow` component is used to render a single row in the table of resources. When a user clicks on the row
 * we also show a drawer with some details of the resource and mark the corresponding row as selected.
 *
 * The `onClick` handler is applied to each `TableCell` instead of the `TableRow` so that we do not have to add the
 * `e.preventDefault()` and `e.stopPropagation()` to all the actions.
 */
const ResourceRow: FunctionComponent<IResourceRowProps> = ({ resource, row, dashboards, refetch }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} hover={true} selected={open}>
        {row.cells.map((cell, cellIndex) => (
          <TableCell key={cellIndex} onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }}>
            {cell}
          </TableCell>
        ))}
        <TableCell>
          <ResourceActions
            resource={resource}
            cluster={row.cluster}
            namespace={row.namespace}
            name={row.name}
            manifest={row.manifest}
            refetch={refetch}
          />
        </TableCell>
      </TableRow>

      {open && (
        <ResourceDetails
          resource={resource}
          cluster={row.cluster}
          namespace={row.namespace}
          name={row.name}
          manifest={row.manifest}
          dashboards={dashboards}
          refetch={refetch}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

/**
 * `IResourceProps` is the interface for the `Resource` component.
 */
interface IResourceProps {
  columns?: IOptionsColumn[];
  filter?: string;
  refetch: () => Promise<QueryObserverResult<unknown, APIError>>;
  resource: IResourceResponse;
}

/**
 * The `Resource` component is responsible for rendering the tab for a resource. Each tab contains a table with the
 * loaded resources and if an error occured during the API call an Alert with all the error messages.
 */
const Resource: FunctionComponent<IResourceProps> = ({ resource, columns, filter, refetch }) => {
  const refetchWithTimout = () => {
    setTimeout(() => {
      refetch();
    }, 5000);
  };

  if (resource.error) {
    return (
      <Box p={6}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              RETRY
            </Button>
          }
        >
          <AlertTitle>Failed to get resources</AlertTitle>
          {resource.error}
        </Alert>
      </Box>
    );
  }

  const tableData =
    resource.resource.id in templates
      ? templates[resource.resource.id]
      : customResourceDefinitionTemplate(resource.resource);
  const errors = getErrors(resource);

  return (
    <>
      {errors.length > 0 ? (
        <Box p={6}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                RETRY
              </Button>
            }
          >
            <AlertTitle>Failed to get resources</AlertTitle>
            <ul style={{ paddingLeft: '16px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        </Box>
      ) : null}

      <TableContainer>
        <Table size="small">
          <TableHead>
            {columns ? (
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Namespace</TableCell>
                <TableCell>Cluster</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.title}>{column.title}</TableCell>
                ))}
                <TableCell />
              </TableRow>
            ) : (
              <TableRow>
                {tableData.columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
                <TableCell />
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {tableData.rows(resource, columns, filter).map((row, rowIndex) => (
              <ResourceRow
                key={`${row.cluster}-${row.namespace}-${row.name}`}
                resource={resource.resource}
                row={row}
                dashboards={resource.dashboards}
                refetch={refetchWithTimout}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

/**
 * `IResourcesProps` is the interface for the `Resources` component.
 */
interface IResourcesProps {
  options: IOptions;
  times: ITimes;
}

/**
 * The `Resources` component is responsible for loading all resources based on the user provided `options`.
 */
const Resources: FunctionComponent<IResourcesProps> = ({ options, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [selectedResource, setSelectedResource] = useState<string>();

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse[], APIError>(
    ['core/resources/resources', options, times],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');

      const c = join(options.clusters?.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`));
      const n = join(options.namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));
      const r = join(options.resources?.map((resource) => `&resource=${encodeURIComponent(resource)}`));

      return apiContext.client.get<IResourceResponse[]>(
        `/api/resources?${options.paramName ? `&paramName=${options.paramName}` : ''}${
          options.param ? `&param=${options.param}` : ''
        }${c}${n}${r}`,
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load Kubernetes resources"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No Kubernetes resources were found"
      noDataMessage="No Kubernetes resources were found for your selected filters."
      refetch={refetch}
    >
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            variant="scrollable"
            scrollButtons={false}
            value={selectedResource ?? data?.[0].resource.id}
            onChange={(_, value) => setSelectedResource(value)}
          >
            {data?.map((resource) => (
              <Tab key={resource.resource.id} label={resource.resource.title} value={resource.resource.id} />
            ))}
          </Tabs>
        </Box>

        {data?.map((resource) => (
          <Box
            key={resource.resource.id}
            hidden={
              selectedResource
                ? resource.resource.id !== selectedResource
                : resource.resource.id !== data[0].resource.id
            }
          >
            {(selectedResource
              ? resource.resource.id === selectedResource
              : resource.resource.id === data[0].resource.id) && (
              <Resource resource={resource} columns={options.columns} filter={options.filter} refetch={refetch} />
            )}
          </Box>
        ))}
      </Card>
    </UseQueryWrapper>
  );
};

export default Resources;
