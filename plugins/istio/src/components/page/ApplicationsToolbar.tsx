import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant, Spinner, ToolbarItem } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IApplicationsOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  name: string;
  options: IApplicationsOptions;
  setOptions: (data: IApplicationsOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ name, options, setOptions }: IPageToolbarProps) => {
  const [showNamespaces, setShowNamespaces] = useState<boolean>(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(options.namespaces || []);

  const { isLoading, isError, error, data } = useQuery<string[], Error>(['istio/namespaces', name], async () => {
    try {
      const response = await fetch(
        `/api/plugins/istio/${name}/namespaces?timeStart=${options.times.timeStart}&timeEnd=${options.times.timeEnd}`,
        {
          method: 'get',
        },
      );

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

  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setSelectedNamespaces([]);
    } else {
      if (selectedNamespaces.includes(namespace)) {
        setSelectedNamespaces(selectedNamespaces.filter((item) => item !== namespace));
      } else {
        setSelectedNamespaces([...selectedNamespaces, namespace]);
      }
    }
  };

  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      namespaces: selectedNamespaces,
      times: times,
    });
  };

  return (
    <Toolbar times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner size="md" />
          </div>
        ) : (
          <Select
            variant={SelectVariant.typeaheadMulti}
            typeAheadAriaLabel="Select namespaces"
            placeholderText="Select namespaces"
            onToggle={(): void => setShowNamespaces(!showNamespaces)}
            onSelect={(e, value): void => selectNamespace(value as string)}
            onClear={(): void => setSelectedNamespaces([])}
            selections={selectedNamespaces}
            isOpen={showNamespaces}
          >
            {isError || !data
              ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get namespaces.'} />]
              : data.map((namespace, index) => <SelectOption key={index} value={namespace} />)}
          </Select>
        )}
      </ToolbarItem>
    </Toolbar>
  );
};

export default PageToolbar;
