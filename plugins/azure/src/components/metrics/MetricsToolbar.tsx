import { Card, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Options } from '@kobsio/plugin-core';

interface IMetricsToolbarProps {
  times: IPluginTimes;
  setTimes: (times: IPluginTimes) => void;
}

const MetricsToolbar: React.FunctionComponent<IMetricsToolbarProps> = ({ times, setTimes }: IMetricsToolbarProps) => {
  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar id="dashboard-toolbar" style={{ zIndex: 300 }}>
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            <ToolbarGroup style={{ width: '100%' }}>
              <ToolbarItem alignment={{ default: 'alignRight' }}>
                <Options
                  timeEnd={times.timeEnd}
                  timeStart={times.timeStart}
                  setOptions={(
                    refresh: boolean,
                    additionalFields: IOptionsAdditionalFields[] | undefined,
                    timeEnd: number,
                    timeStart: number,
                  ): void => setTimes({ timeEnd: timeEnd, timeStart: timeStart })}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default MetricsToolbar;
