import { Alert, AlertActionLink, AlertVariant, CardFooter, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IOptions, IProjectsData } from '../../utils/interfaces';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import NoData from '../panel/NoData';
import Pagination from './Pagination';
import ProjectsList from './ProjectsList';

export interface IProjectsPanelProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
}

const ProjectsPanel: React.FunctionComponent<IProjectsPanelProps> = ({
  instance,
  title,
  description,
}: IProjectsPanelProps) => {
  const [options, setOptions] = useState<IOptions>({ page: 1, perPage: 20, query: '' });

  const { isError, isLoading, error, data, refetch } = useQuery<IProjectsData, Error>(
    ['harbor/projects', instance, options],
    async () => {
      if (!options) {
        return null;
      }

      try {
        const response = await fetch(
          `/api/plugins/harbor/projects?page=${options?.page}&pageSize=${options?.perPage}`,
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
          title="Could not get projects"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IProjectsData, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.total && data.projects && data.projects.length > 0 ? (
        <ProjectsList instance={instance} projects={data.projects} />
      ) : (
        <NoData title="No projects found" description="We could not found any projects for the selected query" />
      )}
    </PluginPanel>
  );
};

export default ProjectsPanel;
