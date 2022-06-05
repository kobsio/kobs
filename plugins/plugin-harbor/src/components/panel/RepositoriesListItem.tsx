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

import { IPluginInstance, LinkWrapper } from '@kobsio/shared';
import { IRepository } from '../../utils/interfaces';
import { formatTime } from '../../utils/helpers';

interface IRepositoriesListItemProps {
  instance: IPluginInstance;
  projectName: string;
  repository: IRepository;
}

const RepositoriesListItem: React.FunctionComponent<IRepositoriesListItemProps> = ({
  instance,
  projectName,
  repository,
}: IRepositoriesListItemProps) => {
  return (
    <LinkWrapper
      to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${projectName}/${encodeURIComponent(
        repository.name.replace(`${projectName}/`, ''),
      )}`}
    >
      <DataListItem id={repository.name} aria-labelledby={repository.name}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="main">
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>{repository.name}</p>
                  </FlexItem>
                  <Flex>
                    <FlexItem>
                      <Label color="grey">Artifacts: {repository.artifact_count || 0}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">Pulls: {repository.pull_count || 0}</Label>
                    </FlexItem>
                    <FlexItem>
                      <Label color="grey">Last Modified Time: {formatTime(repository.update_time)}</Label>
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

export default RepositoriesListItem;
