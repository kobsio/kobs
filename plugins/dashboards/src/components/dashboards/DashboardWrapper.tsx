import React, { useRef } from 'react';

import { IDashboard, IPluginDefaults, useDimensions } from '@kobsio/plugin-core';
import Dashboard from './Dashboard';

interface IDashboardWrapperProps {
  defaults: IPluginDefaults;
  dashboard: IDashboard;
  setDetails?: (details: React.ReactNode) => void;
}

const DashboardWrapper: React.FunctionComponent<IDashboardWrapperProps> = ({
  defaults,
  dashboard,
  setDetails,
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
        setDetails={setDetails}
      />
    </div>
  );
};

export default DashboardWrapper;
