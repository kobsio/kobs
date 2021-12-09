import React, { useState } from 'react';
import { TextInput, ToggleGroup, ToggleGroupItem, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  name: string;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ name, options, setOptions }: IPageToolbarProps) => {
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
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ query: query, times: times, type: type });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
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
    </Toolbar>
  );
};

export default PageToolbar;
