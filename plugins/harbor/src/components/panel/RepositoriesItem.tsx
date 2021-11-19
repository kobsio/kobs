import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IRepository } from '../../utils/interfaces';
import { LinkWrapper } from '@kobsio/plugin-core';
import { formatTime } from '../../utils/helpers';

interface IRepositoriesItemProps {
  name: string;
  projectName: string;
  repository: IRepository;
}

const RepositoriesItem: React.FunctionComponent<IRepositoriesItemProps> = ({
  name,
  projectName,
  repository,
}: IRepositoriesItemProps) => {
  return (
    <LinkWrapper
      link={`/${name}/artifacts/${projectName}/${encodeURIComponent(repository.name.replace(`${projectName}/`, ''))}`}
    >
      <MenuItem
        description={
          <div>
            <span>
              <span className="pf-u-color-400">Artifacts: </span>
              <b className="pf-u-pr-md">{repository.artifact_count || 0}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Pulls: </span>
              <b className="pf-u-pr-md">{repository.pull_count || 0}</b>
            </span>
            <span>
              <span className="pf-u-color-400">Last Modified Time: </span>
              <b className="pf-u-pr-md">{formatTime(repository.update_time)}</b>
            </span>
          </div>
        }
      >
        {repository.name}
      </MenuItem>
    </LinkWrapper>
  );
};

export default RepositoriesItem;
