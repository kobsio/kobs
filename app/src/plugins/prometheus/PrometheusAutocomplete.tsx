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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveringMetricNamesList, setHovering] = useState(false);

  const onFocus = (): void => {
    setInputFocused(true);
  };

  const onBlur = (): void => {
    setInputFocused(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    if (e?.key === 'ArrowUp') {
      if (selectedIndex === 0) {
        setSelectedIndex(data.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    } else if (e?.key === 'ArrowDown') {
      if (selectedIndex + 1 === data.length) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    } else if (e?.key === 'Enter' && selectedIndex > -1) {
      e.preventDefault();
      setQuery(data[selectedIndex]);
      setSelectedIndex(-1);
    } else {
      onEnter(e);
    }
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
            onKeyDown={onKeyDown}
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
      {/* Show metric name suggestions only if there are results and the result is not equal to current text value */}
      {inputFocused && data.length > 0 && !(data.length === 1 && data[0] === query) && (
        <div
          className="pf-c-search-input__menu"
          onMouseEnter={(): void => setHovering(true)}
          onMouseLeave={(): void => setHovering(false)}
        >
          <ul className="pf-c-search-input__menu-list">
            {data.map((result: string, index) => {
              return (
                <li
                  className="pf-c-search-input__menu-list-item"
                  key={result}
                  style={
                    selectedIndex === index && !hoveringMetricNamesList ? { backgroundColor: '#f0f0f0' } : undefined
                  }
                >
                  <button
                    className="pf-c-search-input__menu-item"
                    type="button"
                    onMouseDown={(): void => {
                      setQuery(result);
                      setHovering(false);
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
