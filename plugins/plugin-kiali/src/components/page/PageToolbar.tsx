import React, { useState } from 'react';
import { ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbarNamespaces from './PageToolbarNamespaces';

interface IPageToolbarProps {
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IPageToolbarProps) => {
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

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ namespaces: namespaces, times: times });
  };

  return (
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
        <ToolbarItem style={{ width: '100%' }}>
          <PageToolbarNamespaces instance={instance} namespaces={namespaces || []} selectNamespace={selectNamespace} />
        </ToolbarItem>
        <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default PageToolbar;
