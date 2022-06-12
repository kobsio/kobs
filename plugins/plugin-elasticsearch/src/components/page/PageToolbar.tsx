import React, { useEffect, useState } from 'react';
import { TextInput, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

// PageToolbar is the toolbar for the Elasticsearch plugin page. It allows a user to specify query and to select a start
// time and end time for the query.
const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const [query, setQuery] = useState<string>(options.query);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, query: query });
    }
  };

  // changeOptions changes the Elasticsearch option. It is used when the user clicks the search button or selects a new
  // time range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ ...options, times: times });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
        <ToolbarItem style={{ width: '100%' }}>
          <TextInput
            aria-label="Query"
            type="text"
            value={query}
            onChange={(value: string): void => setQuery(value)}
            onKeyDown={onEnter}
          />
        </ToolbarItem>

        <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default PageToolbar;
