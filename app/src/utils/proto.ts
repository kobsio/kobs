import { ApplicationMetricsVariable } from 'generated/proto/application_pb';
import { DatasourceOptions } from 'generated/proto/datasources_pb';

// IDatasourceOptions must implement the DatasourceOptions message format from the datasources.proto file. It is used,
// to enable the usage of DatasourceOptions message formate within a React State.
export interface IDatasourceOptions {
  resolution?: string;
  timeEnd: number;
  timeStart: number;
}

// convertDatasourceOptionsToProto converts a variable which implements the IDatasourceOptions interface to the
// DatasourceOptions message, so that we can use the options within a gRPC call.
export const convertDatasourceOptionsToProto = (options: IDatasourceOptions): DatasourceOptions => {
  const datasourceOptions = new DatasourceOptions();
  datasourceOptions.setTimestart(options.timeStart);
  datasourceOptions.setTimeend(options.timeEnd);
  datasourceOptions.setResolution(options.resolution ? options.resolution : '');

  return datasourceOptions;
};

// IApplicationMetricsVariable must implement the ApplicationMetricsVariable message format from the application.proto
// file. It is used, to allow the usage of the ApplicationMetricsVariable format via useState.
export interface IApplicationMetricsVariable {
  allowAll: boolean;
  label: string;
  name: string;
  query: string;
  value: string;
  values: string[];
}

// convertApplicationMetricsVariablesToProto converts an array of type IApplicationMetricsVariable to the corresponding
// protobuf message formate ApplicationMetricsVariable.
export const convertApplicationMetricsVariablesToProto = (
  variables: IApplicationMetricsVariable[],
): ApplicationMetricsVariable[] => {
  const applicationMetricsVariables: ApplicationMetricsVariable[] = [];

  for (let i = 0; i < variables.length; i++) {
    const applicationMetricsVariable = new ApplicationMetricsVariable();
    applicationMetricsVariable.setName(variables[i].name);
    applicationMetricsVariable.setLabel(variables[i].label);
    applicationMetricsVariable.setQuery(variables[i].query);
    applicationMetricsVariable.setAllowall(variables[i].allowAll);
    applicationMetricsVariable.setValuesList(variables[i].values);
    applicationMetricsVariable.setValue(variables[i].value);

    applicationMetricsVariables.push(applicationMetricsVariable);
  }

  return applicationMetricsVariables;
};

// convertApplicationMetricsVariablesFromProto converts the protobuf message formate ApplicationMetricsVariable to an
// array of type IApplicationMetricsVariable.
export const convertApplicationMetricsVariablesFromProto = (
  variables: ApplicationMetricsVariable[],
): IApplicationMetricsVariable[] => {
  const applicationMetricsVariables: IApplicationMetricsVariable[] = [];

  for (let i = 0; i < variables.length; i++) {
    applicationMetricsVariables.push({
      allowAll: variables[i].getAllowall(),
      label: variables[i].getLabel(),
      name: variables[i].getName(),
      query: variables[i].getQuery(),
      value: variables[i].getValue(),
      values: variables[i].getValuesList(),
    });
  }

  return applicationMetricsVariables;
};

// IDatasourceMetricsData must implement the DatasourceMetricsData message format from the datasources.proto file. It is
// used within the charts to access the x and y points of an time series.
export interface IDatasourceMetricsData {
  x: number;
  y: number;
}
