import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
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
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={(): void => setDashboard(dashboard)}
    >
      <CardHeader>
        <CardTitle>
          {dashboard.name}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {dashboard.namespace} ({dashboard.cluster})
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>{dashboard.description}</CardBody>
    </Card>
  );
};

export default DashboardsItem;
