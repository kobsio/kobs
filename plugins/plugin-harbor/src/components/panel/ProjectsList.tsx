import { DataList } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IProject } from '../../utils/interfaces';
import ProjectsListItem from './ProjectsListItem';

interface IProjectsListProps {
  instance: IPluginInstance;
  projects: IProject[];
}

const ProjectsList: React.FunctionComponent<IProjectsListProps> = ({ instance, projects }: IProjectsListProps) => {
  return (
    <DataList aria-label="projects list">
      {projects.map((project, index) => (
        <ProjectsListItem key={project.name} instance={instance} project={project} />
      ))}
    </DataList>
  );
};

export default ProjectsList;
