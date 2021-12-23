import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import BuildHistory from './BuildHistory';
import { IArtifact } from '../../../utils/interfaces';
import Overview from './Overview';
import Vulnerabilities from './Vulnerabilities';

interface IReferenceProps {
  name: string;
  projectName: string;
  repositoryName: string;
  artifactReference: string;
}

const Reference: React.FunctionComponent<IReferenceProps> = ({
  name,
  projectName,
  repositoryName,
  artifactReference,
}: IReferenceProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IArtifact, Error>(
    ['harbor/artifact', name, projectName, repositoryName, artifactReference],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/harbor/${name}/artifact?projectName=${projectName}&repositoryName=${repositoryName}&artifactReference=${artifactReference}`,
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
        title="Could not get artifact"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IArtifact, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.extra_attrs && (
        <div>
          <Overview artifact={data} />
          <p>&nbsp;</p>
        </div>
      )}

      <BuildHistory
        name={name}
        projectName={projectName}
        repositoryName={repositoryName}
        artifactReference={artifactReference}
      />
      <p>&nbsp;</p>

      <Vulnerabilities
        name={name}
        projectName={projectName}
        repositoryName={repositoryName}
        artifactReference={artifactReference}
      />
      <p>&nbsp;</p>
    </div>
  );
};

export default Reference;
