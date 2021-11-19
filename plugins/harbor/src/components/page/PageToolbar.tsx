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

interface IPageToolbarProps {
  query: string;
  setQuery: (query: string) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ query, setQuery }: IPageToolbarProps) => {
  const [tmpQuery, setTmpQuery] = useState<string>('');

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setQuery(tmpQuery);
    }
  };

  return (
    <Toolbar id="harbor-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput
                aria-label="Query"
                type="text"
                value={tmpQuery}
                onChange={(value: string): void => setTmpQuery(value)}
                onKeyDown={onEnter}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setQuery(tmpQuery)}>
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default PageToolbar;
