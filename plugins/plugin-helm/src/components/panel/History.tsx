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
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

import Details from './details/Details';
import { IPluginInstance } from '@kobsio/shared';
import { IRelease } from '../../utils/interfaces';
import { formatTimeWrapper } from '../../utils/helpers';

interface IHistoryProps {
  instance: IPluginInstance;
  cluster: string;
  namespace: string;
  release: string;
  setDetails?: (details: React.ReactNode) => void;
}

const History: React.FunctionComponent<IHistoryProps> = ({
  instance,
  cluster,
  namespace,
  release,
  setDetails,
}: IHistoryProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<IRelease[], Error>(
    ['helm/release/history', instance, cluster, namespace, release],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/helm/release/history?cluster=${cluster}&namespace=${namespace}&name=${release}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
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
        title="Could not get history for Helm release"
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
        title="Could not found Helm release history"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IRelease[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>
          We did not found any history for the sepcified Helm release. It might be that that the Helm release does not
          exists or that you do not have the permissions to view the history of the Helm release.
        </p>
      </Alert>
    );
  }

  return (
    <TableComposable aria-label="Helm Release History" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
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
                    History for Helm release was not found
                  </Title>
                  <EmptyStateBody>We could not find the history for the sepcified Helm release.</EmptyStateBody>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        )}
      </Tbody>
    </TableComposable>
  );
};

export default History;
