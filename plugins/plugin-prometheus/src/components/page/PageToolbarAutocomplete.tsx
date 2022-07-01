import { Button, ButtonVariant, TextArea } from '@patternfly/react-core';
import React, { useRef, useState } from 'react';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import { useQuery } from 'react-query';

import { IPluginInstance, useDebounce } from '@kobsio/shared';

interface IPageToolbarAutocomplete {
  instance: IPluginInstance;
  query: string;
  setQuery: (q: string) => void;
  onEnter: (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined) => void;
}

// PageToolbarAutocomplete is used as input for the PromQL query. The component also fetches a list of suggestions for
// the provided input.
const PageToolbarAutocomplete: React.FunctionComponent<IPageToolbarAutocomplete> = ({
  instance,
  query,
  setQuery,
  onEnter,
}: IPageToolbarAutocomplete) => {
  const debouncedQuery = useDebounce(query, 500);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveringMetricNamesList, setHovering] = useState(false);

  const { data } = useQuery<string[], Error>(['prometheus/labelvalues', instance, debouncedQuery], async () => {
    try {
      if (debouncedQuery === '') {
        return undefined;
      }

      const response = await fetch(`/api/plugins/prometheus/labels?searchTerm=${debouncedQuery}`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      throw err;
    }
  });

  // onFocus is used to set the inputFocused variable to true, when the TextArea is focused.
  const onFocus = (): void => {
    setInputFocused(true);
  };

  // onBlur is used to set the inputFocused variable to false, when the TextArea looses the focus.
  const onBlur = (): void => {
    setInputFocused(false);
  };

  // onKeyDown is used to navigate to the suggestion list via the arrow up and arrow down key. When a item is selected
  // and the user presses the enter key, the selected item will be used for the query. When no item is selected and the
  // user presses the enter key, the search is executed.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void => {
    if (e?.key === 'ArrowUp') {
      if (data && selectedIndex === 0) {
        setSelectedIndex(data.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    } else if (data && e?.key === 'ArrowDown') {
      if (selectedIndex + 1 === data.length) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    } else if (data && e?.key === 'Enter' && selectedIndex > -1) {
      e.preventDefault();
      setQuery(data[selectedIndex]);
      setSelectedIndex(-1);
    } else {
      onEnter(e);
    }
  };

  // onMouseDown is used, when a user selects an item from the suggestion via the mouse. When the item is selected, we
  // switch the focus back to the TextArea component.
  const onMouseDown = (result: string): void => {
    setQuery(result);
    setHovering(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <React.Fragment>
      <div className="pf-c-search-input" style={{ width: '100%' }}>
        <div className="pf-c-search-input__bar">
          <span className="pf-c-search-input__text">
            <TextArea
              ref={inputRef}
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
        </div>
        {/* Show metric name suggestions only if there are results and the result is not equal to current text value */}
        {inputFocused && data && data.length > 0 && !(data.length === 1 && data[0] === query) && (
          <div
            className="pf-c-search-input__menu"
            style={{ height: '50vh', overflowX: 'auto' }}
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
                      onMouseDown={(): void => onMouseDown(result)}
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
      <Button variant={ButtonVariant.control} onClick={(): void => setQuery('')}>
        <TimesIcon />
      </Button>
    </React.Fragment>
  );
};

export default PageToolbarAutocomplete;
