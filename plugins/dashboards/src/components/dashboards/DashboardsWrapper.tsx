import React, { useRef } from 'react';

import { IDashboardReference, useDimensions } from '@kobsio/plugin-core';
import Dashboards from './Dashboards';

interface IDashboardsWrapperProps {
  cluster: string;
  namespace: string;
  references: IDashboardReference[];
  setDetails?: (details: React.ReactNode) => void;
}

// The DashboardsWrapper component is a wrapper for the Dashboards component. It is used to determine the dimensions for
// the dashboards. This is needed, so that we can force the default value for the grid span, when the space were the
// dashboards are rendered is to small. We can not use the window width for this, because when the dashboards are
// rendered in a drawer (e.g. application details) the windows width would be incorrect.
// The DashboardsWrapper component should always used in other component. Never use the Dashboards component directly!
export const DashboardsWrapper: React.FunctionComponent<IDashboardsWrapperProps> = ({
  cluster,
  namespace,
  references,
  setDetails,
}: IDashboardsWrapperProps) => {
  const refTabs = useRef<HTMLDivElement>(null);
  const tabsSize = useDimensions(refTabs);

  return (
    <div className="kobsio-dashboards-tabs-fill" ref={refTabs}>
      <Dashboards
        cluster={cluster}
        namespace={namespace}
        references={references}
        setDetails={setDetails}
        forceDefaultSpan={tabsSize.width < 1200}
      />
    </div>
  );
};
