import {
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  GetMetricsRequest,
  GetMetricsResponse,
  Metrics,
  PrometheusPromiseClient,
  Query,
} from 'proto/prometheus_grpc_web_pb';
import { IPrometheusOptions, getOptionsFromSearch } from 'plugins/prometheus/helpers';
import { IPluginPageProps } from 'utils/plugins';
import PrometheusPageData from 'plugins/prometheus/PrometheusPageData';
import PrometheusPageToolbar from 'plugins/prometheus/PrometheusPageToolbar';
import { apiURL } from 'utils/constants';

// prometheusService is the gRPC service to run queries against Prometheus.
const prometheusService = new PrometheusPromiseClient(apiURL, null, null);

// IDataState is the interface for the data state, which consists our of a error message, loading identicator and the
// loaded metrics.
export interface IDataState {
  error: string;
  isLoading: boolean;
  metrics: Metrics.AsObject[];
}

// PrometheusPage is the page component for the Prometheus plugin. The page can be used to directly query a Prometheus
// instance.
const PrometheusPage: React.FunctionComponent<IPluginPageProps> = ({ name, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [data, setData] = useState<IDataState>({
    error: '',
    isLoading: false,
    metrics: [],
  });
  const [options, setOptions] = useState<IPrometheusOptions>(getOptionsFromSearch(location.search));

  // changeOptions is used to change the options for an Prometheus query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (opts: IPrometheusOptions): void => {
    const queries = opts.queries ? opts.queries.map((query) => `&query=${query}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?resolution=${opts.resolution}&timeEnd=${opts.timeEnd}&timeStart=${opts.timeStart}${
        queries.length > 0 ? queries.join('') : ''
      }`,
    });
  };

  // fetchData is used to retrieve the metrics for the given queries in the selected time range with the selected
  // resolution.
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      if (options.queries && options.queries.length > 0 && options.queries[0] !== '') {
        setData({ error: '', isLoading: true, metrics: [] });

        const queries: Query[] = [];
        for (const q of options.queries) {
          const query = new Query();
          query.setQuery(q);
          queries.push(query);
        }

        const getMetricsRequest = new GetMetricsRequest();
        getMetricsRequest.setName(name);
        getMetricsRequest.setTimeend(options.timeEnd);
        getMetricsRequest.setTimestart(options.timeStart);
        getMetricsRequest.setResolution(options.resolution);
        getMetricsRequest.setQueriesList(queries);

        const getMetricsResponse: GetMetricsResponse = await prometheusService.getMetrics(getMetricsRequest, null);
        setData({ error: '', isLoading: false, metrics: getMetricsResponse.toObject().metricsList });
      }
    } catch (err) {
      setData({ error: err.message, isLoading: false, metrics: [] });
    }
  }, [name, options]);

  // useEffect is used to call the fetchData function everytime the Prometheus options are changed.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changeOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    setOptions(getOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {name}
        </Title>
        <p>{description}</p>
        <PrometheusPageToolbar
          name={name}
          queries={options.queries}
          resolution={options.resolution}
          timeEnd={options.timeEnd}
          timeStart={options.timeStart}
          setOptions={changeOptions}
        />
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        {data.isLoading ? (
          <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />
        ) : data.error ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get metrics"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={fetchData}>Retry</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{data.error}</p>
          </Alert>
        ) : (
          <PrometheusPageData metrics={data.metrics} queries={options.queries} />
        )}
      </PageSection>
    </React.Fragment>
  );
};

export default PrometheusPage;
