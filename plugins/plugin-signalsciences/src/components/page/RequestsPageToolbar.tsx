import React, { useState } from 'react';
import { TextInput } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IRequestsOptions } from '../../utils/interfaces';
import ToolbarItemSites from './ToolbarItemSites';

interface IRequestsPageToolbarProps {
  instance: IPluginInstance;
  options: IRequestsOptions;
  setOptions: (data: IRequestsOptions) => void;
}

const RequestsPageToolbar: React.FunctionComponent<IRequestsPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IRequestsPageToolbarProps) => {
  const [siteName, setSiteName] = useState<string>(options.siteName);
  const [query, setQuery] = useState<string>(options.query);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, query: query, siteName: siteName });
    }
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      ...options,
      query: query,
      siteName: siteName,
      times: times,
    });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem width="200px">
        <ToolbarItemSites instance={instance} selectedSite={siteName} selectSite={setSiteName} />
      </ToolbarItem>

      <ToolbarItem grow={true}>
        <TextInput
          aria-label="Query"
          type="text"
          value={query}
          onChange={(value: string): void => setQuery(value)}
          onKeyDown={onEnter}
        />
      </ToolbarItem>

      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default RequestsPageToolbar;
