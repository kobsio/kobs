import { ToggleGroup, ToggleGroupItem, ToolbarItem } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IApplicationOptions } from '../../utils/interfaces';

interface IApplicationToolbarProps {
  options: IApplicationOptions;
  setOptions: (data: IApplicationOptions) => void;
}

const ApplicationToolbar: React.FunctionComponent<IApplicationToolbarProps> = ({
  options,
  setOptions,
}: IApplicationToolbarProps) => {
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ ...options, times: times });
  };

  const setView = (v: string): void => {
    setOptions({ ...options, view: v });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <ToggleGroup aria-label="View">
          <ToggleGroupItem
            text="Metrics"
            isSelected={options.view === 'metrics'}
            onChange={(): void => setView('metrics')}
          />
          <ToggleGroupItem text="Top" isSelected={options.view === 'top'} onChange={(): void => setView('top')} />
          <ToggleGroupItem text="Tap" isSelected={options.view === 'tap'} onChange={(): void => setView('tap')} />
        </ToggleGroup>
      </ToolbarItem>
    </Toolbar>
  );
};

export default ApplicationToolbar;
