import { Alert, AlertActionLink, AlertVariant, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IBuildHistoryItem } from '../../../utils/interfaces';
import { formatTime } from '../../../utils/helpers';

interface IBuildHistoryProps {
  name: string;
  projectName: string;
  repositoryName: string;
  artifactReference: string;
}

const BuildHistory: React.FunctionComponent<IBuildHistoryProps> = ({
  name,
  projectName,
  repositoryName,
  artifactReference,
}: IBuildHistoryProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IBuildHistoryItem[], Error>(
    ['harbor/buildhistory', name, projectName, repositoryName, artifactReference],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/harbor/buildhistory/${name}?projectName=${projectName}&repositoryName=${repositoryName}&artifactReference=${artifactReference}`,
          {
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
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <Card isCompact={true}>
      <CardTitle>Build History</CardTitle>
      <CardBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get build history"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IBuildHistoryItem[], Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <TableComposable aria-label="Build History" variant={TableVariant.compact} borders={false}>
            <Thead>
              <Tr>
                <Th>Created on</Th>
                <Th>Command</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((buildHistoryItem, index) => (
                <Tr key={index}>
                  <Td className="pf-u-text-nowrap">{formatTime(buildHistoryItem.created)}</Td>
                  <Td className="pf-u-text-wrap pf-u-text-break-word">
                    {buildHistoryItem.created_by.replace('/bin/sh -c #(nop) ', '').replace('/bin/sh -c ', '')}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default BuildHistory;
