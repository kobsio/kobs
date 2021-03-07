import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  PageSection,
  PageSectionVariants,
  TextArea,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import { DatasourceMetrics, GetMetricsRequest, GetMetricsResponse } from 'generated/proto/datasources_pb';
import { ApplicationMetricsQuery } from 'generated/proto/application_pb';
import Data from 'components/datasources/prometheus/Data';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import { IDatasourceOptions } from 'utils/proto';
import Options from 'components/applications/details/metrics/Options';
import { apiURL } from 'utils/constants';
import { convertDatasourceOptionsToProto } from 'utils/proto';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

// IQueryOptions is the interface for all query options. It extends the existing datasource options interface and adds
// a new query property.
interface IQueryOptions extends IDatasourceOptions {
  query: string;
}

// parseSearch parses the provided query parameters and returns a query options object. This is needed so that an user
// can share his current URL with other users. So that this URL must contain all properties provided by the user.
const parseSearch = (search: string): IQueryOptions => {
  const params = new URLSearchParams(search);
  return {
    query: params.get('query') ? (params.get('query') as string) : '',
    resolution: params.get('resolution') ? (params.get('resolution') as string) : '',
    timeEnd: params.get('timeEnd') ? parseInt(params.get('timeEnd') as string) : Math.floor(Date.now() / 1000),
    timeStart: params.get('timeStart')
      ? parseInt(params.get('timeStart') as string)
      : Math.floor(Date.now() / 1000) - 3600,
  };
};

export interface IPrometheusProps {
  name: string;
}

// Prometheus implements the Prometheus UI for kobs. It can be used to query a configured Prometheus instance and show
// the results in a list and chart.
const Prometheus: React.FunctionComponent<IPrometheusProps> = ({ name }: IPrometheusProps) => {
  const history = useHistory();
  const location = useLocation();
  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<IDatasourceOptions>();
  const [data, setData] = useState<DatasourceMetrics[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // run changes the query parameters for the current page, to the user provided values. We change the query parameters,
  // instead of directly fetching the data, so that a user can share his current view with other users.
  const run = async (): Promise<void> => {
    history.push({
      pathname: location.pathname,
      search: `?query=${query}&resolution=${options?.resolution}&timeEnd=${options?.timeEnd}&timeStart=${options?.timeStart}`,
    });
  };

  // fetchData is used to fetch all metrics for the user provided query. We also set the user provided datasource
  // options, which are used to set the time range and resolution of the returned time series data.
  const fetchData = useCallback(
    async (queryOptions: IQueryOptions): Promise<void> => {
      try {
        if (queryOptions.query) {
          setIsLoading(true);
          const metricsQuery = new ApplicationMetricsQuery();
          metricsQuery.setQuery(queryOptions.query);

          const getMetricsRequest = new GetMetricsRequest();
          getMetricsRequest.setName(name);
          getMetricsRequest.setOptions(convertDatasourceOptionsToProto(queryOptions));
          getMetricsRequest.setQueriesList([metricsQuery]);

          const getMetricsResponse: GetMetricsResponse = await datasourcesService.getMetrics(getMetricsRequest, null);

          setData(getMetricsResponse.getMetricsList());
          setIsLoading(false);
          setError('');
        }
      } catch (err) {
        setIsLoading(false);
        setError(err.message);
      }
    },
    [name],
  );

  // useEffect is executed every time the query parameters (location.search) are changing. When the parameters are
  // changed we are pasing the query string, setting the corresponding query and options variable and then we are
  // fetching the data.
  useEffect(() => {
    const queryOptions = parseSearch(location.search);
    setQuery(queryOptions.query);
    setOptions(queryOptions);
    fetchData(queryOptions);
  }, [fetchData, location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>

        <Toolbar id="prometheus-query-options" className="kobsio-pagesection-toolbar">
          <ToolbarContent>
            <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
              <ToolbarGroup style={{ width: '100%' }}>
                <ToolbarItem style={{ width: '100%' }}>
                  <TextArea
                    aria-label="PromQL Query"
                    resizeOrientation="vertical"
                    rows={1}
                    type="text"
                    value={query}
                    onChange={(value): void => setQuery(value)}
                  />
                </ToolbarItem>
                {options ? (
                  <ToolbarItem>
                    <Options type="prometheus" options={options} setOptions={(opts): void => setOptions(opts)} />
                  </ToolbarItem>
                ) : null}
                <ToolbarItem>
                  <Button
                    variant={ButtonVariant.primary}
                    spinnerAriaValueText={isLoading ? 'Loading' : undefined}
                    isLoading={isLoading}
                    onClick={run}
                  >
                    Run
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarToggleGroup>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        {error ? (
          <Alert variant={AlertVariant.danger} isInline={false} title="Could not get data">
            <p>{error}</p>
          </Alert>
        ) : (
          <Data data={data} />
        )}
      </PageSection>
    </React.Fragment>
  );
};

export default Prometheus;
