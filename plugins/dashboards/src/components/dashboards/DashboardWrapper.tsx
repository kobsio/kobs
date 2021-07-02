import React, { memo, useEffect, useRef, useState } from 'react';

import { IPluginDefaults, useWindowWidth } from '@kobsio/plugin-core';
import Dashboard from './Dashboard';
import { IDashboard } from '../../utils/interfaces';

interface IDashboardWrapperProps {
  defaults: IPluginDefaults;
  dashboard: IDashboard;
  showDetails?: (details: React.ReactNode) => void;
}

// The DashboardWrapper component is a wrapper for the Dashboard component to determine the width of the dashboard. This
// is required so we can force the default span width for smaller screens. This boolean value is passed as property to
// the Dashboard component.
const DashboardWrapper: React.FunctionComponent<IDashboardWrapperProps> = ({
  defaults,
  dashboard,
  showDetails,
}: IDashboardWrapperProps) => {
  // width, refGrid and forceDefaultSpan are used to determine the current width of the dashboard (this isn't always the
  // screen width, because the dashboard can also be used in a panel), so that we can adjust the size of the rows and
  // columns in the grid.
  const width = useWindowWidth();
  const refGrid = useRef<HTMLDivElement>(null);
  const [forceDefaultSpan, setForceDefaultSpan] = useState<boolean>(false);

  // useEffect is executed every time the window width changes, to determin the size of the grid and use a static span
  // size of 12 if necessary. We have to use the with of the grid instead of the window width, because it is possible
  // that the chart is rendered in a drawer (e.g. for applications in the applications page).
  useEffect(() => {
    if (refGrid && refGrid.current) {
      if (refGrid.current.getBoundingClientRect().width >= 1200) {
        setForceDefaultSpan(false);
      } else {
        setForceDefaultSpan(true);
      }
    }
  }, [width]);

  return (
    <div ref={refGrid}>
      <Dashboard
        defaults={defaults}
        dashboard={dashboard}
        forceDefaultSpan={forceDefaultSpan}
        showDetails={showDetails}
      />
    </div>
  );
};

export default memo(DashboardWrapper, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
