import { Toolbar, ToolbarContent, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import CostManagementToolbarItemScope from './CostManagementToolbarItemScope';
import CostManagementToolbarItemTimeframe from './CostManagementToolbarItemTimeframe';

export interface ICostManagementToolbarProps {
  timeframe: number;
  setTimeframe: (timeframe: number) => void;
  scope: string;
  setScope: (scope: string) => void;
  resourceGroups: string[];
}

const CostManagementToolbar: React.FunctionComponent<ICostManagementToolbarProps> = ({
  timeframe,
  setTimeframe,
  scope,
  setScope,
  resourceGroups,
}: ICostManagementToolbarProps) => {
  return (
    <Toolbar id="cost-management-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarItem variant="label">Scope</ToolbarItem>
          <ToolbarItem>
            <CostManagementToolbarItemScope scope={scope} setScope={setScope} resourceGroups={resourceGroups} />
          </ToolbarItem>
          <ToolbarItem variant="label">Timeframe</ToolbarItem>
          <ToolbarItem>
            <CostManagementToolbarItemTimeframe timeframe={timeframe} setTimeframe={setTimeframe} />
          </ToolbarItem>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default CostManagementToolbar;
