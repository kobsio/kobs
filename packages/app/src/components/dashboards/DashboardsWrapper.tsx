import React, { useRef } from 'react';

import Dashboards from './Dashboards';
import { IReference } from '../../crds/dashboard';
import { useDimensions } from '@kobsio/shared';

interface IDashboardsWrapperProps {
  references: IReference[];
  setDetails?: (details: React.ReactNode) => void;
}

export const DashboardsWrapper: React.FunctionComponent<IDashboardsWrapperProps> = ({
  references,
  setDetails,
}: IDashboardsWrapperProps) => {
  const refTabs = useRef<HTMLDivElement>(null);
  const tabsSize = useDimensions(refTabs);

  return (
    <div style={{ minHeight: '100%' }} ref={refTabs}>
      <Dashboards references={references} forceDefaultSpan={tabsSize.width < 1200} setDetails={setDetails} />
    </div>
  );
};
