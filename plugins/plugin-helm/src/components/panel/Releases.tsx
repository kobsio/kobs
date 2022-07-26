import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Details from './details/Details';
import { IRelease } from '../../utils/interfaces';
import { formatTimeWrapper } from '../../utils/helpers';

interface IReleasesProps {
  instance: IPluginInstance;
  clusters: string[];
  namespaces: string[];
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const Releases: React.FunctionComponent<IReleasesProps> = ({
  instance,
  clusters,
  namespaces,
  times,
  setDetails,
}: IReleasesProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<IRelease[], Error>(
    ['helm/releases', instance, clusters, namespaces, times],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');

        const response = await fetch(`/api/plugins/helm/releases?${clusterParams}&${namespaceParams}`, {
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
            throw new Error('An unknown error occurred');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  const handleReleaseClick = (index: number, release: IRelease): void => {
    if (setDetails) {
      setDetails(
        <Details
          instance={instance}
          cluster={release.cluster || ''}
          namespace={release.namespace || ''}
          release={release.name || ''}
          version={release.version || 0}
          close={(): void => {
            setDetails(undefined);
            setSelectedRow(-1);
          }}
        />,
      );
      setSelectedRow(index);
    }
  };

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get Helm releases"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IRelease[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Alert
        variant={AlertVariant.warning}
        isInline={true}
        title="Could not found Helm releases"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IRelease[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>
          We did not found any Helm releases for the selected cluster / namespace. It might be that there are no Helm
          releases in the selected cluster / namespace or that you do not have the permissions to view them.
        </p>
      </Alert>
    );
  }

  return (
    <TableComposable aria-label="Helm Releases" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Namespace</Th>
          <Th>Cluster</Th>
          <Th>Revision</Th>
          <Th>Updated</Th>
          <Th>Status</Th>
          <Th>Chart</Th>
          <Th>App Version</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data && data.length > 0 ? (
          data.map((release, index) => (
            <Tr
              key={index}
              isHoverable={setDetails ? true : false}
              isRowSelected={selectedRow === index}
              onClick={(): void =>
                setDetails && data && data.length > 0 ? handleReleaseClick(index, release) : undefined
              }
            >
              <Td dataLabel="Name">{release.name || '-'}</Td>
              <Td dataLabel="Namespace">{release.namespace || '-'}</Td>
              <Td dataLabel="Cluster">{release.cluster || '-'}</Td>
              <Td dataLabel="Revision">{release.version || '-'}</Td>
              <Td dataLabel="Updated">
                {release.info?.last_deployed ? formatTimeWrapper(release.info.last_deployed) : '-'}
              </Td>
              <Td dataLabel="Status">{release.info?.status || '-'}</Td>
              <Td dataLabel="Chart">{release.chart?.metadata?.version || '-'}</Td>
              <Td dataLabel="App Version">{release.chart?.metadata?.appVersion || '-'}</Td>
            </Tr>
          ))
        ) : (
          <Tr>
            <Td colSpan={8}>
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.small}>
                  <EmptyStateIcon icon={SearchIcon} />
                  <Title headingLevel="h2" size="lg">
                    No Helm releases found
                  </Title>
                  <EmptyStateBody>
                    We did not find any Helm releases for the specified filter criteria. Select another cluster or
                    namespace.
                  </EmptyStateBody>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        )}
      </Tbody>
    </TableComposable>
  );
};

export default Releases;
