import React, { useEffect, useState } from 'react';
import { TextInput } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface ISearchToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const SearchToolbar: React.FunctionComponent<ISearchToolbarProps> = ({ options, setOptions }: ISearchToolbarProps) => {
  const [jql, setJql] = useState<string>(options.jql);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, jql: jql });
    }
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      ...options,
      jql: jql,
    });
  };

  useEffect(() => {
    setJql(options.jql);
  }, [options.jql]);

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextInput
          aria-label="JQL"
          type="text"
          value={jql}
          onChange={(value: string): void => setJql(value)}
          onKeyDown={onEnter}
        />
      </ToolbarItem>

      <Options times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default SearchToolbar;
