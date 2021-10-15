import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Options } from '@kobsio/plugin-core';

interface IApplicationToolbarProps {
  name: string;
  times: IPluginTimes;
  setOptions: (data: IPluginTimes) => void;
}

const ApplicationToolbar: React.FunctionComponent<IApplicationToolbarProps> = ({
  name,
  times,
  setOptions,
}: IApplicationToolbarProps) => {
  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    setOptions({ timeEnd: timeEnd, timeStart: timeStart });
  };

  return (
    <Toolbar id="istio-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup style={{ width: '100%' }}>
            <ToolbarItem style={{ width: '100%' }}></ToolbarItem>
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
