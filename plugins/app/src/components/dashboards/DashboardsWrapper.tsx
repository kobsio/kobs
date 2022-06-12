import React, { useRef } from 'react';

import Dashboards from './Dashboards';
import { IReference } from '../../crds/dashboard';
import { useDimensions } from '@kobsio/shared';

interface IDashboardsWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  references: IReference[];
  setDetails?: (details: React.ReactNode) => void;
}

export const DashboardsWrapper: React.FunctionComponent<IDashboardsWrapperProps> = ({
  manifest,
  references,
  setDetails,
}: IDashboardsWrapperProps) => {
  const refTabs = useRef<HTMLDivElement>(null);
  const tabsSize = useDimensions(refTabs);

  return (
    <div style={{ minHeight: '100%' }} ref={refTabs}>
      <Dashboards
        manifest={manifest}
        references={references}
        forceDefaultSpan={tabsSize.width < 1200}
        setDetails={setDetails}
      />
    </div>
  );
};
