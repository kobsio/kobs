import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options } from '@kobsio/shared';
import { IApplicationsOptions } from '../../utils/interfaces';

interface IPageToolbarProps {
  instance: IPluginInstance;
  options: IApplicationsOptions;
  setOptions: (data: IApplicationsOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IPageToolbarProps) => {
  const [showNamespaces, setShowNamespaces] = useState<boolean>(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(options.namespaces || []);

  const { isLoading, isError, error, data } = useQuery<string[], Error>(['istio/namespaces', instance], async () => {
    try {
      const response = await fetch(
        `/api/plugins/istio/namespaces?timeStart=${options.times.timeStart}&timeEnd=${options.times.timeEnd}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
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

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({
      namespaces: selectedNamespaces,
      times: times,
    });
  };

  return (
    <ToolbarContent>
      <ToolbarGroup style={{ width: '100%' }}>
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
              onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
                data
                  ? data
                      .filter((namespace) => !value || namespace.includes(value))
                      .map((namespace: string) => <SelectOption key={namespace} value={namespace} />)
                  : []
              }
              selections={selectedNamespaces}
              isOpen={showNamespaces}
              maxHeight="50vh"
            >
              {isError || !data
                ? [<SelectOption key="error" isDisabled={true} value={error?.message || 'Could not get namespaces.'} />]
                : data.map((namespace) => <SelectOption key={namespace} value={namespace} />)}
            </Select>
          )}
        </ToolbarItem>

        <Options times={options.times} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarGroup>
    </ToolbarContent>
  );
};

export default PageToolbar;
