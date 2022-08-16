import { Alert, AlertActionLink, AlertVariant, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IVulnerabilities } from '../../../utils/interfaces';
import VulnerabilitiesRow from './VulnerabilitiesRow';

interface IVulnerabilitiesProps {
  instance: IPluginInstance;
  projectName: string;
  repositoryName: string;
  artifactReference: string;
}

const Vulnerabilities: React.FunctionComponent<IVulnerabilitiesProps> = ({
  instance,
  projectName,
  repositoryName,
  artifactReference,
}: IVulnerabilitiesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IVulnerabilities, Error>(
    ['harbor/vulnerabilities', instance, projectName, repositoryName, artifactReference],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/harbor/vulnerabilities?projectName=${projectName}&repositoryName=${repositoryName}&artifactReference=${artifactReference}`,
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
      <CardTitle>Vulnerabilities</CardTitle>
      <CardBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get vulnerabilities"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IVulnerabilities, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <TableComposable aria-label="Vulnerabilities" variant={TableVariant.compact} borders={true}>
            <Thead>
              <Tr>
                <Th />
                <Th>Vulnerability</Th>
                <Th>Severity</Th>
                <Th>Package</Th>
                <Th>Current Version</Th>
                <Th>Fixed in Version</Th>
              </Tr>
            </Thead>
            {Object.keys(data).map((key) =>
              data[key].vulnerabilities.map((vulnerability) => (
                <VulnerabilitiesRow key={`${key}-${vulnerability.id}`} vulnerability={vulnerability} />
              )),
            )}
          </TableComposable>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default Vulnerabilities;
