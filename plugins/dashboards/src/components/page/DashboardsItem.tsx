import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IDashboard } from '../../utils/interfaces';

interface IDashboardsItemProps {
  dashboard: IDashboard;
}

const DashboardsItem: React.FunctionComponent<IDashboardsItemProps> = ({ dashboard }: IDashboardsItemProps) => {
  return (
    <Card isCompact={true} isHoverable={true}>
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
