import React from 'react';
import { TextArea } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
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
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ ...options, times: times });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextArea
          aria-label="Query"
          resizeOrientation="vertical"
          rows={1}
          type="text"
          value={options.query}
          onChange={changeQuery}
        />
      </ToolbarItem>

      <Options times={options.times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default AggregationToolbar;
