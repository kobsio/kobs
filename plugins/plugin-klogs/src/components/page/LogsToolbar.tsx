import React, { useEffect, useState } from 'react';
import { TextArea } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface ILogsToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const LogsToolbar: React.FunctionComponent<ILogsToolbarProps> = ({ options, setOptions }: ILogsToolbarProps) => {
  const [query, setQuery] = useState<string>(options.query);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we will not add a newline.
  // Instead of this we are calling the setOptions function to trigger the search.
  // use "SHIFT" + "ENTER" to write multiple lines.
  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextArea
          aria-label="Query"
          resizeOrientation="vertical"
          rows={1}
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
    </Toolbar>
  );
};

export default LogsToolbar;
