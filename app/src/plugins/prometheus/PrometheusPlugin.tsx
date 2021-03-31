import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  GetVariablesRequest,
  GetVariablesResponse,
  PrometheusPromiseClient,
  Variable,
} from 'proto/prometheus_grpc_web_pb';
import { IPluginProps } from 'utils/plugins';
import { ITimes } from 'plugins/prometheus/helpers';
import PluginDataMissing from 'components/plugins/PluginDataMissing';
import PrometheusPluginCharts from 'plugins/prometheus/PrometheusPluginCharts';
import PrometheusPluginToolbar from 'plugins/prometheus/PrometheusPluginToolbar';
import { apiURL } from 'utils/constants';

// prometheusService is the gRPC service to get the values for all defined variables via their corresponding PromQL
// query.
const prometheusService = new PrometheusPromiseClient(apiURL, null, null);

// PrometheusPlugin is the component, which is used for the Prometheus plugin, within the plugin view.
const PrometheusPlugin: React.FunctionComponent<IPluginProps> = ({ name, description, plugin }: IPluginProps) => {
  const [error, setError] = useState<string>('');
  const [times, setTimes] = useState<ITimes>({
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 3600,
  });
  const [variables, setVariables] = useState<Variable.AsObject[]>(
    plugin.prometheus ? plugin.prometheus.variablesList : [],
  );
  const [variablesValue, setVariablesValue] = useState<Variable.AsObject[]>(
    plugin.prometheus ? plugin.prometheus.variablesList : [],
  );

  // fetchVariables is used to fetch all values for all variables. When we successfully fetched all values we change,
  // the passed in variables property.
  const fetchVariables = useCallback(async () => {
    try {
      if (name !== '' && variablesValue.length > 0) {
        const vars: Variable[] = [];
        for (const variable of variablesValue) {
          const v = new Variable();
          v.setName(variable.name);
          v.setLabel(variable.label);
          v.setQuery(variable.query);
          v.setAllowall(variable.allowall);
          v.setValuesList(variable.valuesList);
          v.setValue(variable.value);
          vars.push(v);
        }

        const getVariablesRequest = new GetVariablesRequest();
        getVariablesRequest.setName(name);
        getVariablesRequest.setTimeend(times.timeEnd);
        getVariablesRequest.setTimestart(times.timeStart);
        getVariablesRequest.setVariablesList(vars);

        const getVariablesResponse: GetVariablesResponse = await prometheusService.getVariables(
          getVariablesRequest,
          null,
        );

        const tmpVariables = getVariablesResponse.toObject().variablesList;
        setVariables(tmpVariables);
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
  }, [name, times, variablesValue]);

  // useEffect is used to run the fetchVariables function on every render, when the name, times, variables or
  // setVariables function changes.
  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  if (!plugin.prometheus) {
    return (
      <PluginDataMissing
        title="Prometheus properties are missing"
        description="The Prometheus properties are missing in your CR for this application. Visit the documentation to learn more on how to use the Prometheus plugin in an Application CR."
        documentation="https://kobs.io"
        type="prometheus"
      />
    );
  }

  if (error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not load variables"
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
    <React.Fragment>
      <PrometheusPluginToolbar
        name={name}
        variables={variables}
        times={times}
        setVariables={setVariablesValue}
        setTimes={setTimes}
      />
      {variables.length === 0 || variables[0].value !== '' ? (
        <PrometheusPluginCharts name={name} times={times} variables={variables} charts={plugin.prometheus.chartsList} />
      ) : null}
    </React.Fragment>
  );
};

export default PrometheusPlugin;
