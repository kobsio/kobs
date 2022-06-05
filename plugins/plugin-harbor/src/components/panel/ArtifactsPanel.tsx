import { Alert, AlertActionLink, AlertVariant, CardFooter, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IArtifactsData, IOptions } from '../../utils/interfaces';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import ArtifactsList from './ArtifactsList';
import NoData from '../panel/NoData';
import Pagination from './Pagination';

export interface IArtifactsPanelProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  projectName: string;
  repositoryName: string;
  query: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ArtifactsPanel: React.FunctionComponent<IArtifactsPanelProps> = ({
  instance,
  title,
  description,
  projectName,
  repositoryName,
  query,
  setDetails,
}: IArtifactsPanelProps) => {
  const [options, setOptions] = useState<IOptions>({ page: 1, perPage: 20, query: query });

  const { isError, isLoading, error, data, refetch } = useQuery<IArtifactsData, Error>(
    ['harbor/artifacts', instance, options, projectName, repositoryName],
    async () => {
      if (!options) {
        return null;
      }

      try {
        const response = await fetch(
          `/api/plugins/harbor/artifacts?projectName=${projectName}&repositoryName=${repositoryName}&query=${options.query}&page=${options.page}&pageSize=${options.perPage}`,
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
    <PluginPanel
      title={title}
      description={description}
      footer={
        <CardFooter>
          <Pagination
            count={data && data.total ? data.total : 0}
            options={options}
            setOptions={setOptions}
            noPadding={true}
          />
        </CardFooter>
      }
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get artifacts"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IArtifactsData, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.total && data.artifacts && data.artifacts.length > 0 ? (
        <ArtifactsList
          instance={instance}
          projectName={projectName}
          repositoryName={repositoryName}
          artifacts={data.artifacts}
          setDetails={setDetails}
        />
      ) : (
        <NoData title="No artifacts found" description="We could not found any artifacts for the selected query" />
      )}
    </PluginPanel>
  );
};

export default ArtifactsPanel;
