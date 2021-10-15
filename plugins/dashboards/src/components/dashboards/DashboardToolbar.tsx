import { Card, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { IOptionsAdditionalFields, IPluginTimes, Options } from '@kobsio/plugin-core';
import DashboardToolbarVariable from './DashboardToolbarVariable';
import { IVariableValues } from '../../utils/interfaces';

interface IDashboardToolbarProps {
  variables: IVariableValues[];
  setVariables: (variables: IVariableValues[]) => void;
  times: IPluginTimes;
  setTimes: (times: IPluginTimes) => void;
}

// The DashboardToolbar component renders the toolbar for a dashboard. The toolbar contains a select box for each
// variable (DashboardToolbarVariable) and the options modal, were a user can select a time range, which is then passed
// to all the panels so that it can be used by the plugins (e.g. only show metrics for the selected time range).
const DashboardToolbar: React.FunctionComponent<IDashboardToolbarProps> = ({
  variables,
  setVariables,
  times,
  setTimes,
}: IDashboardToolbarProps) => {
  // selectValue is used to modify the value of the passed in variables. For this we are using the index of the variable
  // in the array to set the new value and then we are calling the setVariable function from the parent component.
  const selectValue = (index: number, value: string): void => {
    const tmpVariables = [...variables];
    tmpVariables[index].value = value;
    setVariables(tmpVariables);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar id="dashboard-toolbar" style={{ zIndex: 300 }}>
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            {variables.map((variable, index) =>
              variable.hide ? null : (
                <ToolbarItem key={variable.name}>
                  <DashboardToolbarVariable
                    variable={variable}
                    selectValue={(value: string): void => selectValue(index, value)}
                  />
                </ToolbarItem>
              ),
            )}
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

export default DashboardToolbar;
