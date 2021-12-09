import React, { useState } from 'react';
import { ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import PageToolbarNamespaces from './PageToolbarNamespaces';

interface IPageToolbarProps {
  name: string;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ name, options, setOptions }: IPageToolbarProps) => {
  const [namespaces, setNamespaces] = useState<string[] | undefined>(options.namespaces);

  // selectNamespace adds/removes the given namespace to the list of selected namespaces. When the namespace value is an
  // empty string the selected namespaces list is cleared.
  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setNamespaces([]);
    } else {
      if (namespaces) {
        if (namespaces.includes(namespace)) {
          setNamespaces(namespaces.filter((item) => item !== namespace));
        } else {
          setNamespaces([...namespaces, namespace]);
        }
      } else {
        setNamespaces([namespace]);
      }
    }
  };

  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ namespaces: namespaces, times: times });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <PageToolbarNamespaces name={name} namespaces={namespaces || []} selectNamespace={selectNamespace} />
      </ToolbarItem>
    </Toolbar>
  );
};

export default PageToolbar;
