import { Toolbar, ToolbarContent, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import CostManagementToolbarItemTimeframe from './CostManagementToolbarItemTimeframe';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

export interface ICostManagementToolbarProps {
  timeframe: number;
  setTimeframe: (timeframe: number) => void;
}

const CostManagementToolbar: React.FunctionComponent<ICostManagementToolbarProps> = ({
  timeframe,
  setTimeframe,
}: ICostManagementToolbarProps) => {
  return (
    <Toolbar id="cost-management-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
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
