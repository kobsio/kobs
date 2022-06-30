import { Button, ButtonVariant, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { Toolbar, ToolbarItem } from '@kobsio/shared';
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
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions(data);
    }
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextInput aria-label="Query" type="text" value={data.query} onChange={changeQuery} onKeyDown={onEnter} />
      </ToolbarItem>
      <ToolbarItem alignRight={true}>
        <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={(): void => setOptions(data)}>
          Search
        </Button>
      </ToolbarItem>
    </Toolbar>
  );
};

export default PageToolbar;
