import { TextInput, ToolbarItem } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IAggregationOptions } from '../../utils/interfaces';

interface IAggregationToolbarProps {
  options: IAggregationOptions;
  setOptions: (data: IAggregationOptions) => void;
}

const AggregationToolbar: React.FunctionComponent<IAggregationToolbarProps> = ({
  options,
  setOptions,
}: IAggregationToolbarProps) => {
  // changeQuery changes the value of a query.
  const changeQuery = (value: string): void => {
    setOptions({ ...options, query: value });
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ ...options, times: times });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={false} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <TextInput aria-label="Query" type="text" value={options.query} onChange={changeQuery} />
      </ToolbarItem>
    </Toolbar>
  );
};

export default AggregationToolbar;
