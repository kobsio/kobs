import {
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { IOptionsAdditionalFields, Options } from '@kobsio/plugin-core';
import { IVisualizationOptions } from '../../utils/interfaces';

interface IVisualizationToolbarProps {
  options: IVisualizationOptions;
  setOptions: (data: IVisualizationOptions) => void;
}

const VisualizationToolbar: React.FunctionComponent<IVisualizationToolbarProps> = ({
  options,
  setOptions,
}: IVisualizationToolbarProps) => {
  const changeQuery = (value: string): void => {
    setOptions({ ...options, query: value });
  };

  // changeOptions changes the ClickHouse option. If the options are changed via the refresh button of the Options
  // component we directly modify the options of the parent component, if not we only change the data of the toolbar
  // component and the user can trigger an action via the search button.
  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    setOptions({ ...options, times: { timeEnd: timeEnd, timeStart: timeStart } });
  };

  return (
    <Toolbar id="clickhouse-visualization-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <TextInput aria-label="Query" type="text" value={options.query} onChange={changeQuery} />
            </ToolbarItem>
            <ToolbarItem>
              <Options timeEnd={options.times.timeEnd} timeStart={options.times.timeStart} setOptions={changeOptions} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default VisualizationToolbar;
