import { DataList } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';
import { IRepository } from '../../utils/interfaces';
import RepositoriesListItem from './RepositoriesListItem';

interface IRepositoriesListProps {
  instance: IPluginInstance;
  projectName: string;
  repositories: IRepository[];
}

const RepositoriesList: React.FunctionComponent<IRepositoriesListProps> = ({
  instance,
  projectName,
  repositories,
}: IRepositoriesListProps) => {
  return (
    <DataList aria-label="repositories list">
      {repositories.map((repository) => (
        <RepositoriesListItem
          key={repository.name}
          instance={instance}
          projectName={projectName}
          repository={repository}
        />
      ))}
    </DataList>
  );
};

export default RepositoriesList;
