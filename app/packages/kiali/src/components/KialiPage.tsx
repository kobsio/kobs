import {
  APIContext,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  useLocalStorageState,
  useQueryState,
} from '@kobsio/core';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Alert, AlertTitle, Autocomplete, Checkbox, Chip, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useEffect } from 'react';

import { Topology } from './Topology';

import { description } from '../utils/utils';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

interface IOptions extends ITimes {
  namespaces: string[];
}

const SelectNamespaces: FunctionComponent<{
  instance: IPluginInstance;
  selectNamespaces: (namespaces: string[]) => void;
  selectedNamespaces: string[];
}> = ({ instance, selectedNamespaces, selectNamespaces }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], Error>(['kiali/namespaces', instance], async () => {
    return apiContext.client.get<string[]>('/api/plugins/kiali/namespaces', {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedNamespaces}
      onChange={(e, value) => selectNamespaces(value)}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 0 }}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Namespaces" placeholder="Namespaces" />}
    />
  );
};

const KialiPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IOptions>('kobs-kiali-page-options', {
    namespaces: [],
    time: 'custom',
    timeEnd: 0,
    timeStart: 0,
  });
  const [options, setOptions] = useQueryState<IOptions>({
    namespaces: persistedOptions.namespaces,
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={
        <Toolbar>
          <ToolbarItem grow={true}>
            <SelectNamespaces
              instance={instance}
              selectedNamespaces={options.namespaces}
              selectNamespaces={(namespaces) => setOptions({ ...options, namespaces: namespaces })}
            />
          </ToolbarItem>
          <ToolbarItem align="right">
            <Options
              times={options}
              showOptions={true}
              showSearchButton={false}
              setOptions={(times) => {
                setOptions({ ...times, namespaces: options.namespaces });
              }}
            />
          </ToolbarItem>
        </Toolbar>
      }
    >
      {options.namespaces.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a namespace</AlertTitle>
          You have to select at least one namespace to see the topology graph.
        </Alert>
      ) : (
        <Topology instance={instance} namespaces={options.namespaces} times={options} />
      )}
    </Page>
  );
};

export default KialiPage;
