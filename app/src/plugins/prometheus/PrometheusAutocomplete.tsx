import { MetricLookupRequest, MetricLookupResponse } from 'proto/prometheus_pb';
import React, { useCallback, useEffect, useState } from 'react';
import { PrometheusPromiseClient } from 'proto/prometheus_grpc_web_pb';
import { TextArea } from '@patternfly/react-core';
import { apiURL } from 'utils/constants';

interface IPrometheusAutocomplete {
  name: string;
  query: string;
  setQuery: (q: string) => void;
  onEnter: (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined) => void;
}

export const PrometheusAutocomplete: React.FunctionComponent<IPrometheusAutocomplete> = ({
  name,
  query,
  setQuery,
  onEnter,
}: IPrometheusAutocomplete): JSX.Element => {
  const [data, setData] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

  const onFocus = (): void => {
    setInputFocused(true);
  };

  const onBlur = (): void => {
    setInputFocused(false);
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
      setData(metricLookupResponse.toObject().namesList);
    } catch (err) {
      setData([]);
    }
  }, [name, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="pf-c-search-input" style={{ width: '100%' }}>
      <div className="pf-c-search-input__bar">
        <span className="pf-c-search-input__text">
          <TextArea
            aria-label="PromQL Query"
            resizeOrientation="vertical"
            rows={1}
            type="text"
            value={query}
            onChange={(value): void => setQuery(value)}
            onKeyDown={onEnter}
            onFocus={onFocus}
            onBlur={onBlur}
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
      {inputFocused && data.length > 0 && (
        <div className="pf-c-search-input__menu">
          <ul className="pf-c-search-input__menu-list">
            {data.map((result: string) => {
              return (
                <li className="pf-c-search-input__menu-list-item" key={result}>
                  <button
                    className="pf-c-search-input__menu-item"
                    type="button"
                    onMouseDown={(): void => {
                      setQuery(result);
                    }}
                  >
                    <span className="pf-c-search-input__menu-item-text">{result}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
