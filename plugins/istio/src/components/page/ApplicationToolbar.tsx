import {
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { IOptionsAdditionalFields, Options } from '@kobsio/plugin-core';
import { IApplicationOptions } from '../../utils/interfaces';

interface IApplicationToolbarProps extends IApplicationOptions {
  setOptions: (data: IApplicationOptions) => void;
}

const ApplicationToolbar: React.FunctionComponent<IApplicationToolbarProps> = ({
  view,
  times,
  filters,
  setOptions,
}: IApplicationToolbarProps) => {
  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    setOptions({ filters: filters, times: { timeEnd: timeEnd, timeStart: timeStart }, view: view });
  };

  const setView = (v: string): void => {
    setOptions({ filters: filters, times: times, view: v });
  };

  return (
    <Toolbar id="istio-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}>
              <ToggleGroup aria-label="View">
                <ToggleGroupItem
                  text="Metrics"
                  isSelected={view === 'metrics'}
                  onChange={(): void => setView('metrics')}
                />
                <ToggleGroupItem text="Top" isSelected={view === 'top'} onChange={(): void => setView('top')} />
                <ToggleGroupItem text="Tap" isSelected={view === 'tap'} onChange={(): void => setView('tap')} />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem>
              <Options timeEnd={times.timeEnd} timeStart={times.timeStart} setOptions={changeOptions} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ApplicationToolbar;
