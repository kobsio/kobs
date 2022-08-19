import {
  Avatar,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import React from 'react';

import { IProject } from '../../utils/project';

import icon from '../../assets/icon.png';

interface IProjectsItemProps {
  project: IProject;
}

const ProjectsItem: React.FunctionComponent<IProjectsItemProps> = ({ project }: IProjectsItemProps) => {
  return (
    <DataListItem id={project.key} aria-labelledby={project.key}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'row' }}>
                <FlexItem>
                  {project.avatarUrls && project.avatarUrls['48x48'] ? (
                    <Avatar style={{ height: '42px', width: '42px' }} alt="" src={project.avatarUrls['48x48']} />
                  ) : (
                    <Avatar style={{ height: '42px', width: '42px' }} alt="" src={icon} />
                  )}
                </FlexItem>
                <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
                  <div className="pf-u-font-weight-bold">{project.key}</div>
                  <div className="pf-u-text-truncate">{project.name}</div>
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

export default ProjectsItem;
