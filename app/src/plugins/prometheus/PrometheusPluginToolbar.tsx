import { Card, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';

import { ITimes } from 'plugins/prometheus/helpers';
import Options from 'components/Options';
import PrometheusVariable from 'plugins/prometheus/PrometheusVariable';
import { Variable } from 'proto/prometheus_grpc_web_pb';

interface IPrometheusPluginToolbarProps {
  name: string;
  variables?: Variable.AsObject[];
  times: ITimes;
  setVariables: (variables: Variable.AsObject[]) => void;
  setTimes: (times: ITimes) => void;
}

// PrometheusPluginToolbar is the toolbar for the Prometheus plugin. The toolbar allows a user to select a variable
// value and time range for the metrics, which are shown via charts.
const PrometheusPluginToolbar: React.FunctionComponent<IPrometheusPluginToolbarProps> = ({
  name,
  variables,
  times,
  setVariables,
  setTimes,
}: IPrometheusPluginToolbarProps) => {
  // onSelectVariableValue is executed, when the user selects a new value for a variable. It will create a copy of the
  // current variables, changes the value and sets the new values in the parent component.
  const onSelectVariableValue = (value: string, index: number): void => {
    if (variables) {
      const tmpVariables = [...variables];
      tmpVariables[index].value = value;
      setVariables(tmpVariables);
    }
  };

  return (
    <Card>
      <Toolbar id="prometheus-toolbar">
        <ToolbarContent>
          <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
            {variables ? (
              <ToolbarGroup>
                <ToolbarItem>
                  {variables.map((variable, index) => (
                    <ToolbarItem key={index}>
                      <PrometheusVariable
                        variable={variable}
                        selectValue={(value: string): void => onSelectVariableValue(value, index)}
                      />
                    </ToolbarItem>
                  ))}
                </ToolbarItem>
              </ToolbarGroup>
            ) : null}
            <ToolbarGroup style={{ width: '100%' }}>
              <ToolbarItem alignment={{ default: 'alignRight' }}>
                <Options
                  pTimeEnd={times.timeEnd}
                  pTimeStart={times.timeStart}
                  setValues={(additionalFields, timeEnd, timeStart): void =>
                    setTimes({ timeEnd: timeEnd, timeStart: timeStart })
                  }
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarToggleGroup>
        </ToolbarContent>
      </Toolbar>
    </Card>
  );
};

export default PrometheusPluginToolbar;
