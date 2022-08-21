import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardActions,
  DataList,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { IPluginInstance, LinkWrapper, PluginPanel, pluginBasePath, useDebounce } from '@kobsio/shared';
import { IProject } from '../../utils/project';
import ProjectsItem from './ProjectsItem';

interface IProjectsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
}

const Projects: React.FunctionComponent<IProjectsProps> = ({ title, description, instance }: IProjectsProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  const { isError, isLoading, error, data, refetch } = useQuery<IProject[], Error>(
    ['jira/projects', instance],
    async () => {
      const response = await fetch('/api/plugins/jira/projects', {
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
          throw new Error('An unknown error occured');
        }
      }
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <TextInput
            placeholder="Filter"
            aria-label="Filter"
            value={searchTerm}
            onChange={(value: string): void => setSearchTerm(value)}
          />
        </CardActions>
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
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IProject[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="projects" isCompact={true}>
          {data
            .filter(
              (project) =>
                project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                project.key?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
            )
            .map((project) => (
              <LinkWrapper
                key={project.id}
                to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`project = ${project.key}`)}`}
              >
                <ProjectsItem project={project} />
              </LinkWrapper>
            ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default Projects;
