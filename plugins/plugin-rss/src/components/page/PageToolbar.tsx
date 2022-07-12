import React, { useState } from 'react';
import { TextInput } from '@patternfly/react-core';

import { IOptionsAdditionalFields, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const [url, setUrl] = useState<string>(options.url);

  // onEnter is used to detect if the user pressed the "ENTER" key. If this is the case we are calling the setOptions
  // function to trigger the search.
  // use "SHIFT" + "ENTER".
  const onEnter = (e: React.KeyboardEvent<HTMLInputElement> | undefined): void => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      setOptions({ ...options, url: url });
    }
  };

  // changeOptions changes the klogs option. It is used when the user clicks the search button or selects a new time
  // range.
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ times: times, url: url });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <TextInput
          aria-label="Feed URL"
          type="text"
          value={url}
          onChange={(value: string): void => setUrl(value)}
          onKeyDown={onEnter}
        />
      </ToolbarItem>

      <Options times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default PageToolbar;
