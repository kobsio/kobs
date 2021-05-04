import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardHeaderMain,
  EmptyState,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  Chart,
  GetTableDataRequest,
  GetTableDataResponse,
  PrometheusPromiseClient,
  Query,
  Row,
  Variable,
} from 'proto/prometheus_grpc_web_pb';
import { ITimes } from 'plugins/prometheus/helpers';
import PrometheusChartActions from 'plugins/prometheus/PrometheusChartActions';
import { apiURL } from 'utils/constants';

// prometheusService is the gRPC service to get the table data for all defined queries in a chart.
const prometheusService = new PrometheusPromiseClient(apiURL, null, null);

// getCellValue returns the correct value for a row from the given column name. If the value wasn't found we return an
// empty string.
const getCellValue = (name: string, row: Row.AsObject): string => {
  for (const column of row.columnsMap) {
    if (column[0] === name) {
      return column[1];
    }
  }

  return '';
};

interface IDataState {
  error: string;
  interpolatedQueries: string[];
  isLoading: boolean;
  rows: [string, Row.AsObject][];
}

interface IPrometheusPluginTableProps {
  name: string;
  times: ITimes;
  variables: Variable.AsObject[];
  chart: Chart.AsObject;
}

// PrometheusPluginTable is the component, which loads the data for a chart with the type "table" and reders the table,
// when the data was loaded successful.
const PrometheusPluginTable: React.FunctionComponent<IPrometheusPluginTableProps> = ({
  name,
  times,
  variables,
  chart,
}: IPrometheusPluginTableProps) => {
  const [data, setData] = useState<IDataState>({ error: '', interpolatedQueries: [], isLoading: false, rows: [] });

  // fetchData fetches the table data for the given chart definition and the loaded variable values.
  const fetchData = useCallback(async () => {
    try {
      if (name !== '' && chart.queriesList.length > 0) {
        setData({ error: '', interpolatedQueries: [], isLoading: true, rows: [] });

        const queries: Query[] = [];
        for (const q of chart.queriesList) {
          const query = new Query();
          query.setQuery(q.query);
          query.setLabel(q.label);
          queries.push(query);
        }

        const vars: Variable[] = [];
        for (const variable of variables) {
          const v = new Variable();
          v.setName(variable.name);
          v.setLabel(variable.label);
          v.setQuery(variable.query);
          v.setAllowall(variable.allowall);
          v.setValuesList(variable.valuesList);
          v.setValue(variable.value);
          vars.push(v);
        }

        const getTableDataRequest = new GetTableDataRequest();
        getTableDataRequest.setName(name);
        getTableDataRequest.setTimeend(times.timeEnd);
        getTableDataRequest.setQueriesList(queries);
        getTableDataRequest.setVariablesList(vars);

        const getTableDataResponse: GetTableDataResponse = await prometheusService.getTableData(
          getTableDataRequest,
          null,
        );

        setData({
          error: '',
          interpolatedQueries: getTableDataResponse.toObject().interpolatedqueriesList,
          isLoading: false,
          rows: getTableDataResponse.toObject().rowsMap,
        });
      }
    } catch (err) {
      setData({ error: err.message, interpolatedQueries: [], isLoading: false, rows: [] });
    }
  }, [name, times, variables, chart]);

  // useEffect is used to call the fetchData function every time a property of the component is updated.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader>
        <CardHeaderMain>{chart.title}</CardHeaderMain>
        <CardActions>
          <PrometheusChartActions name={name} times={times} interpolatedQueries={data.interpolatedQueries} />
        </CardActions>
      </CardHeader>
      <CardBody>
        {data.isLoading ? (
          <EmptyState>
            <EmptyStateIcon variant="container" component={Spinner} />
          </EmptyState>
        ) : data.error ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get table data"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={fetchData}>Retry</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{data.error}</p>
          </Alert>
        ) : (
          <div style={{ height: '336px', maxWidth: '100%', overflow: 'scroll' }}>
            <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
              <Thead>
                <Tr>
                  {chart.columnsList.map((column, index) => (
                    <Th key={index}>{column.header ? column.header : column.name}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.rows.map((row) => (
                  <Tr key={row[0]}>
                    {chart.columnsList.map((column, index) => (
                      <Td key={index} dataLabel={column.header ? column.header : column.name}>
                        {getCellValue(column.name, row[1])} {column.unit}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PrometheusPluginTable;
