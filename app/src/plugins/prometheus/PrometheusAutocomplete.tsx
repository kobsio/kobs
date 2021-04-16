import { MetricLookupRequest, MetricLookupResponse } from 'proto/prometheus_pb';
import React, { useCallback, useEffect, useState } from 'react';
import { PrometheusPromiseClient } from 'proto/prometheus_grpc_web_pb';
import { TextArea } from '@patternfly/react-core';
import { apiURL } from 'utils/constants';

const MetricNames = ({ results }: { results: string[] }): JSX.Element | null => {
  return results.length === 0 ? null : (
    <div className="pf-c-search-input__menu">
      <ul className="pf-c-search-input__menu-list">
        {results.map((result: string) => {
          return (
            <li className="pf-c-search-input__menu-list-item" key={result}>
              <button className="pf-c-search-input__menu-item" type="button">
                <span className="pf-c-search-input__menu-item-text">{result}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

interface IPrometheusAutocomplete {
  name: string;
}

export const PrometheusAutocomplete: React.FunctionComponent<IPrometheusAutocomplete> = ({
  name,
}: IPrometheusAutocomplete): JSX.Element => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<string[]>([]);

  // changeQuery changes the value of a single query.
  // const changeQuery = (index?: number, value?: string): void => {
  //   // const tmpQueries = [...data.queries];
  //   // tmpQueries[index] = value;
  //   // setData({ ...data, queries: tmpQueries });
  // };
  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we will not add a newline.
  // Instead of this we are calling the setOptions function to trigger the search. To enter a newline the user has to
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    // if (e?.key === 'Enter' && !e.shiftKey) {
    //   e.preventDefault();
    //   setOptions(data);
    // }
  };

  // fetchData is used to retrieve the metrics for the given queries in the selected time range with the selected
  // resolution.
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const metricLookupRequest = new MetricLookupRequest();
      const prometheusService = new PrometheusPromiseClient(apiURL, null, null);
      metricLookupRequest.setName(name);
      metricLookupRequest.setMatcher(query);
      const metricLookupResponse: MetricLookupResponse = await prometheusService.metricLookup(
        metricLookupRequest,
        null,
      );
      debugger;
      setData(metricLookupResponse.toObject().namesList);
    } catch (err) {
      setData([]);
    }
  }, [name, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="pf-c-search-input">
      <div className="pf-c-search-input__bar">
        <span className="pf-c-search-input__text">
          {/*<span className="pf-c-search-input__icon">*/}
          {/*  <i className="fas fa-search fa-fw" aria-hidden="true"></i>*/}
          {/*</span>*/}
          <TextArea
            aria-label="PromQL Query"
            resizeOrientation="vertical"
            rows={1}
            type="text"
            value={query}
            onChange={(value): void => setQuery(value)}
            onKeyDown={onEnter}
          />
        </span>
        <span className="pf-c-search-input__utilities">
          <span className="pf-c-search-input__clear">
            <button
              className="pf-c-button pf-m-plain"
              type="button"
              aria-label="Clear"
              onClick={(): void => setQuery('')}
            >
              <i className="fas fa-times fa-fw" aria-hidden="true"></i>
            </button>
          </span>
        </span>
      </div>
      <MetricNames results={data} />
    </div>
  );
};
