import React, { useEffect, useState } from 'react';
import { TextInput } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptionsLogs } from '../../utils/interfaces';

interface ILogsPageToolbarProps {
  options: IOptionsLogs;
  setOptions: (data: IOptionsLogs) => void;
}

const LogsPageToolbar: React.FunctionComponent<ILogsPageToolbarProps> = ({
  options,
  setOptions,
}: ILogsPageToolbarProps) => {
  const [query, setQuery] = useState<string>(options.query);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, query: query });
    }
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      ...options,
      query: query,
      times: times,
    });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

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

      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default LogsPageToolbar;
