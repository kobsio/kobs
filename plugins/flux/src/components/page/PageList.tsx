import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, emptyState } from '@kobsio/plugin-core';
import Details from '../panel/details/Details';
import { TApiType } from '../../utils/interfaces';

interface IPageListProps {
  name: string;
  cluster: string;
  type: TApiType;
  title: string;
  showDetails?: (details: React.ReactNode) => void;
}

const PageList: React.FunctionComponent<IPageListProps> = ({
  name,
  cluster,
  type,
  title,
  showDetails,
}: IPageListProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const resource =
    clustersContext.resources && clustersContext.resources.hasOwnProperty(type)
      ? clustersContext.resources[type]
      : undefined;

  const { isError, isLoading, error, data, refetch } = useQuery<IRow[], Error>(
    ['flux/list', name, cluster, type],
    async () => {
      try {
        if (!resource) {
          throw new Error('Could not find resource');
        }

        const response = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&resource=${resource.resource}&path=/apis/${resource.path}`,
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
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <Table
          aria-label={title}
          variant="compact"
          borders={false}
          isStickyHeader={true}
          cells={resource?.columns || ['']}
          rows={
            data && data.length > 0 && data[0].cells?.length === resource?.columns.length
              ? data
              : emptyState(resource?.columns.length || 3, isLoading, isError, error)
          }
        >
          <TableHeader />
          <TableBody
            onRowClick={
              showDetails && resource && data && data.length > 0 && data[0].cells?.length === resource.columns.length
                ? (e, row, props, data): void =>
                    showDetails(
                      <Details
                        name={name}
                        type={type}
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
      </CardBody>
    </Card>
  );
};

export default PageList;
