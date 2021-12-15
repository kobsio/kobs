import {
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

interface IDashboardsToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const DashboardsToolbar: React.FunctionComponent<IDashboardsToolbarProps> = ({
  searchTerm,
  setSearchTerm,
}: IDashboardsToolbarProps) => {
  return (
    <Toolbar id="dashboards-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput
                aria-label="Search"
                placeholder="Search"
                type="text"
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default DashboardsToolbar;
