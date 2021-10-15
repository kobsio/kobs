import {
  Button,
  ButtonVariant,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { IOptionsAdditionalFields, IPluginTimes, Options } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';

interface IPageToolbarProps extends IOptions {
  name: string;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  name,
  namespaces,
  times,
  setOptions,
}: IPageToolbarProps) => {
  const [showNamespaces, setShowNamespaces] = useState<boolean>(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(namespaces || []);
  const [selectedTimes, setSelectedTimes] = useState<IPluginTimes>(times);

  const { isLoading, isError, error, data } = useQuery<string[], Error>(['istio/namespaces', name], async () => {
    try {
      const response = await fetch(
        `/api/plugins/istio/namespaces/${name}?timeStart=${selectedTimes.timeStart}&timeEnd=${selectedTimes.timeEnd}`,
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

  const changeOptions = (
    refresh: boolean,
    additionalFields: IOptionsAdditionalFields[] | undefined,
    timeEnd: number,
    timeStart: number,
  ): void => {
    if (refresh) {
      setOptions({
        namespaces: selectedNamespaces,
        times: { timeEnd: timeEnd, timeStart: timeStart },
      });
    }

    setSelectedTimes({ timeEnd: timeEnd, timeStart: timeStart });
  };

  return (
    <Toolbar id="istio-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup style={{ width: '100%' }} toggleIcon={<FilterIcon />} breakpoint="lg">
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
                  selections={selectedNamespaces}
                  isOpen={showNamespaces}
                >
                  {isError || !data
                    ? [
                        <SelectOption
                          key="error"
                          isDisabled={true}
                          value={error?.message || 'Could not get namespaces.'}
                        />,
                      ]
                    : data.map((namespace, index) => <SelectOption key={index} value={namespace} />)}
                </Select>
              )}
            </ToolbarItem>
            <ToolbarItem>
              <Options timeEnd={selectedTimes.timeEnd} timeStart={selectedTimes.timeStart} setOptions={changeOptions} />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => setOptions({ namespaces: selectedNamespaces, times: selectedTimes })}
              >
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default PageToolbar;
