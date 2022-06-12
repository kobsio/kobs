import {
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, LinkWrapper, pluginBasePath } from '@kobsio/shared';
import { IProject } from '../../utils/interfaces';

interface IProjectsListItemProps {
  instance: IPluginInstance;
  project: IProject;
}

const ProjectsListItem: React.FunctionComponent<IProjectsListItemProps> = ({
  instance,
  project,
}: IProjectsListItemProps) => {
  return (
    <LinkWrapper to={`${pluginBasePath(instance)}/${project.name}`}>
      <DataListItem id={project.name} aria-labelledby={project.name}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="main">
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>{project.name}</p>
                  </FlexItem>
                  <Flex>
                    <FlexItem>
                      <Label color="grey">Repos: {project.repo_count || 0}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">Charts: {project.chart_count || 0}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">
                        Access Level: {project.metadata.public === 'true' ? 'public' : 'private'}
                      </Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">Auto Scan: {project.metadata.auto_scan ? 'enabled' : 'disabled'}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">Severity: {project.metadata.severity || '-'}</Label>
                    </FlexItem>
                  </Flex>
                </Flex>
              </DataListCell>,
            ]}
          />
        </DataListItemRow>
      </DataListItem>
    </LinkWrapper>
  );
};

export default ProjectsListItem;
