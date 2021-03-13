import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Toolbar as PatternflyToolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import { GetVariablesRequest, GetVariablesResponse } from 'generated/proto/datasources_pb';
import {
  IApplicationMetricsVariable,
  IDatasourceOptions,
  convertApplicationMetricsVariablesFromProto,
  convertApplicationMetricsVariablesToProto,
  convertDatasourceOptionsToProto,
} from 'utils/proto';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import Options from 'components/applications/details/metrics/Options';
import Variable from 'components/applications/details/metrics/Variable';
import { apiURL } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

interface IToolbarProps {
  datasourcenName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
  setDatasourceOptions: (options: IDatasourceOptions) => void;
  variables: IApplicationMetricsVariable[];
  setVariables: (variables: IApplicationMetricsVariable[]) => void;
}

// Toolbar component displays a list of all variables and an options field. The variables are displayed via a dropdown
// and can be selected by the user. If the user selects a new value, the variables property will be changed via the
// setVariables function, so that the change is also propergated to the corresponding charts. The same counts for the
// datasource options.
const Toolbar: React.FunctionComponent<IToolbarProps> = ({
  datasourcenName,
  datasourceType,
  datasourceOptions,
  setDatasourceOptions,
  variables,
  setVariables,
}: IToolbarProps) => {
  const [error, setError] = useState<string>('');

  // onSelectVariableValue is executed, when the user selects a new value for a variable. It will create a copy of the
  // current variables, changes the value and sets the new values in the parent component.
  const onSelectVariableValue = (value: string, index: number): void => {
    const tmpVariables = [...variables];
    tmpVariables[index].value = value;
    setVariables(tmpVariables);
  };

  // fetchVariables is used to fetch all values for all variables. When we successfully fetched all values we change,
  // the passed in variables property.
  // HACK: Since this ends in an endless rerendering and fetching we have omit the setVariables in the dependency array.
  // We also have to compare the JSON representation of the variables prop and the loaded variables, to omit unnecessary
  // rerenderings. Maybe we can also do this before the fetch, so that we do not fetch the variables twice.
  const fetchVariables = useCallback(async () => {
    try {
      if (datasourcenName !== '' && variables.length > 0) {
        const getVariablesRequest = new GetVariablesRequest();
        getVariablesRequest.setName(datasourcenName);
        getVariablesRequest.setOptions(convertDatasourceOptionsToProto(datasourceOptions));
        getVariablesRequest.setVariablesList(convertApplicationMetricsVariablesToProto(variables));

        const getVariablesResponse: GetVariablesResponse = await datasourcesService.getVariables(
          getVariablesRequest,
          null,
        );

        const tmpVariables = convertApplicationMetricsVariablesFromProto(getVariablesResponse.getVariablesList());
        if (JSON.stringify(tmpVariables) !== JSON.stringify(variables)) {
          setVariables(tmpVariables);
        }
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourcenName, datasourceOptions, variables]);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  // If an error occured during, we show the user the error, with an option to retry the request.
  if (error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get variables"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchVariables}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <PatternflyToolbar id="metrics-toolbar">
      <ToolbarContent>
        <ToolbarToggleGroup className="kobs-fullwidth" toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            {variables.map((variable, index) => (
              <ToolbarItem key={index}>
                <Variable
                  variable={variable}
                  selectValue={(value: string): void => onSelectVariableValue(value, index)}
                />
              </ToolbarItem>
            ))}
          </ToolbarGroup>
          <ToolbarGroup className="kobs-fullwidth">
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <Options type={datasourceType} options={datasourceOptions} setOptions={setDatasourceOptions} />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </PatternflyToolbar>
  );
};

export default Toolbar;
