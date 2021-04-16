import {
  Button,
  ButtonVariant,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

interface IOpsgeniePageToolbarProps {
  query: string;
  setQuery: (query: string) => void;
}

// OpsgeniePageToolbar renders the toolbar with the text input and search button for the OpsgeniePageAlerts component.
const OpsgeniePageToolbar: React.FunctionComponent<IOpsgeniePageToolbarProps> = ({
  query,
  setQuery,
}: IOpsgeniePageToolbarProps) => {
  const [data, setData] = useState<string>(query);

  // onEnter is used to execute the search, when the user presses enter within the text input field.
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setQuery(data);
    }
  };

  return (
    <Toolbar id="elasticsearch-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput
                aria-label="Query"
                type="text"
                value={data}
                onChange={(value: string): void => setData(value)}
                onKeyDown={onEnter}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setQuery(data)}>
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default OpsgeniePageToolbar;
