import React, { useState } from 'react';
import { TextInput, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const [query, setQuery] = useState<string>(options.query);
  const [type, setType] = useState<string>(options.type);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, query });
    }
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ query: query, times: times, type: type });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextInput
          aria-label="Query"
          type="text"
          value={query}
          onChange={(value: string): void => setQuery(value)}
          onKeyDown={onEnter}
        />
      </ToolbarItem>

      <ToolbarItem>
        <ToggleGroup aria-label="View">
          <ToggleGroupItem text="Alerts" isSelected={type === 'alerts'} onChange={(): void => setType('alerts')} />
          <ToggleGroupItem
            text="Incidents"
            isSelected={type === 'incidents'}
            onChange={(): void => setType('incidents')}
          />
        </ToggleGroup>
      </ToolbarItem>

      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default PageToolbar;
