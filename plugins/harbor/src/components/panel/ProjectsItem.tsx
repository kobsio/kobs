import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IProject } from '../../utils/interfaces';
import { LinkWrapper } from '@kobsio/plugin-core';

interface IProjectsItemProps {
  name: string;
  project: IProject;
}

const ProjectsItem: React.FunctionComponent<IProjectsItemProps> = ({ name, project }: IProjectsItemProps) => {
  return (
    <LinkWrapper link={`/${name}/repositories/${project.name}`}>
      <MenuItem
        description={
          <div>
            <span>
              <span className="pf-u-color-400">Repos: </span>
              <b className="pf-u-pr-md">{project.repo_count || 0}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Charts: </span>
              <b className="pf-u-pr-md">{project.chart_count || 0}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Access Level: </span>
              <b className="pf-u-pr-md">{project.metadata.public ? 'public' : 'private'}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Auto Scan: </span>
              <b className="pf-u-pr-md">{project.metadata.auto_scan ? 'enabled' : 'disabled'}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Severity: </span>
              <b className="pf-u-pr-md">{project.metadata.severity || '-'}</b>
            </span>
          </div>
        }
      >
        {project.name}
      </MenuItem>
    </LinkWrapper>
  );
};

export default ProjectsItem;
