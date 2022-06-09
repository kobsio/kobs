import { ToggleGroup, ToggleGroupItem, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';
import { IApplicationOptions } from '../../utils/interfaces';

interface IApplicationToolbarProps {
  options: IApplicationOptions;
  setOptions: (data: IApplicationOptions) => void;
}

const ApplicationToolbar: React.FunctionComponent<IApplicationToolbarProps> = ({
  options,
  setOptions,
}: IApplicationToolbarProps) => {
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ ...options, times: times });
  };

  const setView = (v: string): void => {
    setOptions({ ...options, view: v });
  };

  return (
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
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
        <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default ApplicationToolbar;
