import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
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
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <PageToolbarNamespaces instance={instance} namespaces={namespaces || []} selectNamespace={selectNamespace} />
      </ToolbarItem>
      <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default PageToolbar;
