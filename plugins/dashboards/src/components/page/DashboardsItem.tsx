import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IDashboard } from '@kobsio/plugin-core';

interface IDashboardsItemProps {
  dashboard: IDashboard;
  setDashboard: (value: IDashboard | undefined) => void;
}

const DashboardsItem: React.FunctionComponent<IDashboardsItemProps> = ({
  dashboard,
  setDashboard,
}: IDashboardsItemProps) => {
  return (
    <MenuItem description={dashboard.description} onClick={(): void => setDashboard(dashboard)}>
      {dashboard.name}
      <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
        {dashboard.namespace} ({dashboard.cluster})
      </span>
    </MenuItem>
  );
};

export default DashboardsItem;
