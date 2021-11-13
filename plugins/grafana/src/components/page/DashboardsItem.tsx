import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IDashboard } from '../../utils/interfaces';

interface IDashboardItemProps {
  dashboard: IDashboard;
  publicAddress: string;
}

const DashboardItem: React.FunctionComponent<IDashboardItemProps> = ({
  dashboard,
  publicAddress,
}: IDashboardItemProps) => {
  return (
    <MenuItem
      to={publicAddress + dashboard.url}
      description={
        <div>
          <span>
            <span className="pf-u-color-400">Folder: </span>
            <b className="pf-u-pr-md">{dashboard.folderTitle || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Tags: </span>
            <b className="pf-u-pr-md">
              {dashboard.tags && dashboard.tags.length > 0 ? dashboard.tags.join(', ') : '-'}
            </b>
          </span>
        </div>
      }
    >
      {dashboard.title}
    </MenuItem>
  );
};

export default DashboardItem;
