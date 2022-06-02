import { Card, Toolbar, ToolbarContent, ToolbarGroup, ToolbarGroupVariant, ToolbarItem } from '@patternfly/react-core';
import React from 'react';

import { IOptionsAdditionalFields, ITimes, Options } from '@kobsio/shared';
import DashboardToolbarVariable from './DashboardToolbarVariable';
import { IVariableValues } from '../../crds/dashboard';

interface IDashboardToolbarProps {
  variables: IVariableValues[];
  setVariables: (variables: IVariableValues[]) => void;
  times: ITimes;
  setTimes: (times: ITimes) => void;
}

const DashboardToolbar: React.FunctionComponent<IDashboardToolbarProps> = ({
  variables,
  setVariables,
  times,
  setTimes,
}: IDashboardToolbarProps) => {
  const selectValue = (index: number, value: string): void => {
    const tmpVariables = [...variables];
    tmpVariables[index].value = value;
    setVariables(tmpVariables);
  };

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  return (
    <Card style={{ maxWidth: '100%' }}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
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
          </ToolbarGroup>
          <Options times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default DashboardToolbar;
