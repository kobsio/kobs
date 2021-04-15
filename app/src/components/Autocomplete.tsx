import React, { useState } from 'react';
import { TextArea } from '@patternfly/react-core';

const results = ['up', 'kube_node_info'];

export const Autocomplete = (): JSX.Element => {
  const [query, setQuery] = useState('');

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
  return (
    <div className="pf-c-search-input">
      <div className="pf-c-search-input__bar">
        <span className="pf-c-search-input__text">
          <span className="pf-c-search-input__icon">
            <i className="fas fa-search fa-fw" aria-hidden="true"></i>
          </span>
          <TextArea
            // aria-label={`PromQL Query ${index}`}
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
            <button className="pf-c-button pf-m-plain" type="button" aria-label="Clear">
              <i className="fas fa-times fa-fw" aria-hidden="true"></i>
            </button>
          </span>
        </span>
      </div>
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
    </div>
  );
};
