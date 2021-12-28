import { Card, ToolbarItem } from '@patternfly/react-core';
import React from 'react';

import { IDashboardVariableValues, IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import DashboardToolbarVariable from './DashboardToolbarVariable';

interface IDashboardToolbarProps {
  variables: IDashboardVariableValues[];
  setVariables: (variables: IDashboardVariableValues[]) => void;
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

  // changeOptions changes the time in a dashboard.
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions}>
        <React.Fragment>
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
        </React.Fragment>
      </Toolbar>
    </Card>
  );
};

export default DashboardToolbar;
