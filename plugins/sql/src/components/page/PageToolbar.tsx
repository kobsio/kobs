import {
  Button,
  ButtonVariant,
  TextArea,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';

import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (options: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const [data, setData] = useState<IOptions>(options);

  // changeQuery changes the value of a query.
  const changeQuery = (value: string): void => {
    setData({ ...data, query: value });
  };

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setOptions(data);
    }
  };

  return (
    <Toolbar id="sql-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextArea
                aria-label="Query"
                resizeOrientation="vertical"
                rows={1}
                type="text"
                value={data.query}
                onChange={changeQuery}
                onKeyDown={onEnter}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setOptions(data)}>
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
