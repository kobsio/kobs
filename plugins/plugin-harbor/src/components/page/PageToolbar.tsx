import {
  Button,
  ButtonVariant,
  SearchInput,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
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
  const onEnter = (e: React.KeyboardEvent<HTMLDivElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ page: 1, perPage: 20, query: data.query });
    }
  };

  return (
    <ToolbarContent>
      <ToolbarItem variant={ToolbarItemVariant['search-filter']}>
        <SearchInput
          aria-label="Search input"
          value={data.query}
          onChange={(value: string): void => changeQuery(value)}
          onClear={(): void => changeQuery('')}
          onKeyDown={onEnter}
        />
      </ToolbarItem>
      <ToolbarItem>
        <Button
          variant={ButtonVariant.primary}
          icon={<SearchIcon />}
          onClick={(): void => setOptions({ page: 1, perPage: 20, query: data.query })}
        >
          Search
        </Button>
      </ToolbarItem>
    </ToolbarContent>
  );
};

export default PageToolbar;
