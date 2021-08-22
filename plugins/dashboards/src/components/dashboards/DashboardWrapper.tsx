import React, { useRef } from 'react';

import { IPluginDefaults, useDimensions } from '@kobsio/plugin-core';
import Dashboard from './Dashboard';
import { IDashboard } from '../../utils/interfaces';

interface IDashboardWrapperProps {
  defaults: IPluginDefaults;
  dashboard: IDashboard;
  showDetails?: (details: React.ReactNode) => void;
}

const DashboardWrapper: React.FunctionComponent<IDashboardWrapperProps> = ({
  defaults,
  dashboard,
  showDetails,
}: IDashboardWrapperProps) => {
  const refWrapper = useRef<HTMLDivElement>(null);
  const tabsSize = useDimensions(refWrapper);

  return (
    <div ref={refWrapper}>
      <Dashboard
        activeKey=""
        eventKey=""
        defaults={defaults}
        dashboard={dashboard}
        forceDefaultSpan={tabsSize.width < 1200}
        showDetails={showDetails}
      />
    </div>
  );
};

export default DashboardWrapper;
