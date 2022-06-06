import React, { useEffect, useState } from 'react';
import { TextInput, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface ILogsToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const LogsToolbar: React.FunctionComponent<ILogsToolbarProps> = ({ options, setOptions }: ILogsToolbarProps) => {
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
    if (additionalFields && additionalFields.length === 2) {
      setOptions({
        ...options,
        order: additionalFields[1].value,
        orderBy: additionalFields[0].value,
        query: query,
        times: times,
      });
    }
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

        <Options
          times={options.times}
          additionalFields={[
            {
              label: 'Order By',
              name: 'orderBy',
              placeholder: 'timestamp',
              value: options.orderBy,
            },
            {
              label: 'Order',
              name: 'order',
              placeholder: '',
              type: 'select',
              value: options.order,
              values: ['ascending', 'descending'],
            },
          ]}
          showOptions={true}
          showSearchButton={true}
          setOptions={changeOptions}
        />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default LogsToolbar;
