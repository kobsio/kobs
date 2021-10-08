import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { memo } from 'react';
import { useQuery } from 'react-query';

import { IResource, emptyState } from '@kobsio/plugin-core';
import Details from './details/Details';

interface IPanelListItemProps {
  clusters: string[];
  namespaces: string[];
  resource: IResource;
  selector: string;
  showDetails?: (details: React.ReactNode) => void;
}

const PanelListItem: React.FunctionComponent<IPanelListItemProps> = ({
  clusters,
  namespaces,
  resource,
  selector,
  showDetails,
}: IPanelListItemProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IRow[], Error>(
    ['resources/panellistitem', clusters, namespaces, resource.scope, resource.resource, resource.path, selector],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');
        const path = resource.isCRD ? `/apis/${resource.path}` : resource.path;

        const response = await fetch(
          `/api/plugins/resources/resources?${clusterParams}${
            resource.scope === 'Namespaced' ? `&${namespaceParams}` : ''
          }&resource=${resource.resource}&path=${path}${selector ? `&paramName=labelSelector&param=${selector}` : ''}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return resource.rows(json);
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
  );

  // refetchhWithDelay is used to call the refetch function to get the resource, but with a delay of 3 seconde. This is
  // required, because sometime the Kubenretes isn't that fast after an action (edit, delete, ...) was triggered.
  const refetchhWithDelay = (): void => {
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  return (
    <Table
      aria-label={resource.title}
      variant="compact"
      borders={false}
      cells={resource.columns}
      rows={
        data && data.length > 0 && data[0].cells?.length === resource.columns.length
          ? data
          : emptyState(resource.columns.length, isLoading, isError, error)
      }
    >
      <TableHeader />
      <TableBody
        onRowClick={
          showDetails && data && data.length > 0 && data[0].cells?.length === resource.columns.length
            ? (e, row, props, data): void =>
                showDetails(
                  <Details
                    request={resource}
                    resource={row}
                    close={(): void => showDetails(undefined)}
                    refetch={refetchhWithDelay}
                  />,
                )
            : undefined
        }
      />
    </Table>
  );
};

export default memo(PanelListItem, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
