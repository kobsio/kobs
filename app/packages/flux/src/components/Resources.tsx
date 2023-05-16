import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  timeDifference,
  UseQueryWrapper,
} from '@kobsio/core';
import {
  Alert,
  AlertTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Card,
} from '@mui/material';
import { useQuery, QueryObserverResult } from '@tanstack/react-query';
import { JSONPath } from 'jsonpath-plus';
import { FunctionComponent, useContext, useState } from 'react';

import ResourceActions from './ResourceActions';
import ResourceDetails from './ResourceDetails';

import { fluxResources, IFluxResource, IFluxResourceColumn, TFluxType } from '../utils/utils';

/**
 * `IResourceResponse` is the interface for the response of the resource API endpoint. If contains all the manifests for
 * all specified clusters and namespaces. It also contains the resource with the API version for the requested Flux
 * resource, which is needed for the `ResourceActions`.
 */
interface IResourceResponse {
  clusters?: IResourceResponseCluster[];
  error?: string;
  resource: IResource;
}

export interface IResource {
  path: string;
  resource: string;
}

interface IResourceResponseCluster {
  cluster?: string;
  error?: string;
  namespaces?: IResourceResponseNamespace[];
}

interface IResourceResponseNamespace {
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest?: any;
  namespace?: string;
}

/**
 * `IRow` is the interface for a single row in the resource table.
 */
interface IRow {
  cells: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
}

/**
 * `generateRows` generatess the rows for the returned manifests in the `resource` response, based on the provided
 * `columns`. The returned row will contain a list of cells, where the first three cells are the name, namespace and
 * cluster. It will also contain the manifest for the resource.
 */
const generateRows = (resource: IResourceResponse, columns: IFluxResourceColumn[]): IRow[] => {
  const rows: IRow[] = [];

  if (resource.clusters) {
    for (const cluster of resource.clusters) {
      if (cluster.namespaces) {
        for (const namespace of cluster.namespaces) {
          if (namespace.manifest) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const crList: any = namespace.manifest;

            for (const cr of crList.items) {
              const row: IRow = {
                cells: [cr?.metadata?.name ?? '', cr?.metadata?.namespace ?? '', cluster.cluster ?? ''],
                manifest: cr,
              };

              for (const column of columns) {
                const value = JSONPath<string | string[]>({ json: cr, path: column.jsonPath })[0];

                if (column.type === 'boolean') {
                  row.cells.push((value as unknown as boolean) === true ? 'True' : 'False');
                } else if (!value) {
                  row.cells.push('');
                } else if (column.type === 'date') {
                  row.cells.push(timeDifference(new Date().getTime(), new Date(value).getTime()));
                } else if (Array.isArray(value)) {
                  row.cells.push(value.join(', '));
                } else {
                  row.cells.push(value);
                }
              }

              rows.push(row);
            }
          }
        }
      }
    }
  }

  return rows;
};

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
 * The `ResourceRow` component is used to render a single row in the table of resources. When a user clicks on the row
 * we also show a drawer with some details of the resource and mark the corresponding row as selected.
 *
 * The `onClick` handler is applied to each `TableCell` instead of the `TableRow` so that we do not have to add the
 * `e.preventDefault()` and `e.stopPropagation()` to all the actions.
 */
const ResourceRow: FunctionComponent<{
  fluxResource: IFluxResource;
  instance: IPluginInstance;
  path: string;
  refetch: () => void;
  resource: string;
  row: IRow;
}> = ({ instance, fluxResource, row, resource, path, refetch }) => {
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
            instance={instance}
            fluxResource={fluxResource}
            cluster={row.cells[2]}
            namespace={row.cells[1]}
            name={row.cells[0]}
            manifest={row.manifest}
            resource={resource}
            path={path}
            refetch={refetch}
          />
        </TableCell>
      </TableRow>

      {open && (
        <ResourceDetails
          instance={instance}
          fluxResource={fluxResource}
          cluster={row.cells[2]}
          namespace={row.cells[1]}
          name={row.cells[0]}
          manifest={row.manifest}
          resource={resource}
          path={path}
          refetch={refetch}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

/**
 * The `Resource` component renders a table for the provided `resource`. If the API response contains an error the
 * error(s) will be shown. If the API response doesn't contain a error we show a table for with the returned manifests.
 * The columns which should be shown are defined via the `fluxResource`.
 */
const Resource: FunctionComponent<{
  fluxResource: IFluxResource;
  instance: IPluginInstance;
  refetch: () => Promise<QueryObserverResult<unknown, APIError>>;
  resource: IResourceResponse;
}> = ({ instance, resource, fluxResource, refetch }) => {
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
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Cluster</TableCell>
              {fluxResource.columns.map((column) => (
                <TableCell key={column.title}>{column.title}</TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {generateRows(resource, fluxResource.columns).map((row, rowIndex) => (
              <ResourceRow
                key={`${row.cells[0]}-${row.cells[1]}-${row.cells[2]}`}
                instance={instance}
                fluxResource={fluxResource}
                resource={resource.resource.resource}
                path={resource.resource.path}
                row={row}
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
 * The `Resources` component is responsible for loading the CRs for the provided `resource`. We are reusing the API
 * endpoint from the resources here, so that the Flux resources from multiple clusters and namespaces can be shown.
 */
const Resources: FunctionComponent<{
  clusters: string[];
  instance: IPluginInstance;
  namespaces: string[];
  param: string;
  paramName: string;
  resource: TFluxType;
  times: ITimes;
}> = ({ instance, clusters, namespaces, resource, paramName, param, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const fluxResource = fluxResources[resource];

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceResponse[], APIError>(
    ['flux/resources', instance, clusters, namespaces, resource, paramName, param, times],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');

      const c = join(clusters?.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`));
      const n = join(namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));

      return apiContext.client.get<IResourceResponse[]>(
        `/api/resources?${paramName ? `&paramName=${paramName}` : ''}${
          param ? `&param=${param}` : ''
        }${c}${n}&resource=${encodeURIComponent(fluxResource.resource)}`,
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load Flux resources"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length !== 1}
      noDataTitle="No Flux resources were found"
      noDataMessage="No Flux resources were found for your selected filters."
      refetch={refetch}
    >
      <Card>
        {data && data.length === 1 && (
          <Resource instance={instance} resource={data[0]} fluxResource={fluxResource} refetch={refetch} />
        )}
      </Card>
    </UseQueryWrapper>
  );
};

export default Resources;
