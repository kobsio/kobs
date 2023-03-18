import { Search, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Autocomplete,
  Checkbox,
  Chip,
  TextField,
  Box,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent, useState, FormEvent, useEffect } from 'react';

import { IApplicationOptions } from './utils';

import { APIContext, IAPIContext } from '../../context/APIContext';
import { ResourcesSelectClusters } from '../resources/ResourcesSelectClusters';
import { ResourcesSelectNamespaces } from '../resources/ResourcesSelectNamespaces';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

/**
 * `IApplicationsToolbarTagsProps` is the interface for the properties for the `ApplicationsToolbarTags` component. The
 * component requires a list of selected tags and a function to change the selected tags.
 */
interface IApplicationsToolbarTagsProps {
  selectTags: (tags: string[]) => void;
  selectedTags: string[];
}

/**
 * The `ApplicationsToolbarTags` component is used to render a select box, where the user can select a list of tags, to
 * filter the list of applications. The component is also responsible for loading all available tags from our API.
 */
const ApplicationsToolbarTags: FunctionComponent<IApplicationsToolbarTagsProps> = ({ selectedTags, selectTags }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isLoading, data } = useQuery<string[], Error>(['core/applications/tags'], async () => {
    return apiContext.client.get<string[]>('/api/applications/tags');
  });

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      value={selectedTags}
      onChange={(e, value) => selectTags(value)}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) => (
        <li {...props} style={{ padding: 1 }}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label="Tags" placeholder="Tags" />}
    />
  );
};

/**
 * `IApplicationsToolbarProps` is the interface for the `ApplicationsToolbar` component, which requires all the options
 * which can be set by a user and a function to change these options.
 */
interface IApplicationsToolbarProps {
  options: IApplicationOptions;
  setOptions: (data: IApplicationOptions) => void;
}

/**
 * The `ApplicationsToolbar` renders a toolbar, to filter the list of applications. For this we need the initial options
 * selected by a user and a function to change these options. A user can filter the applications by a search term, the
 * cluster, namespace and tags.
 */
const ApplicationsToolbar: FunctionComponent<IApplicationsToolbarProps> = ({ options, setOptions }) => {
  const [searchTerm, setSearchTerm] = useState<string>(options.searchTerm ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar. During the submit we call the provided `setOptions` function and
   * set the `page` and `perPage` parameters to their initial values. This is required to pass the users selected
   * filters to the parent component.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, page: 1, searchTerm: searchTerm });
  };

  const handleChange = (key: string, value: boolean | string | string[]) => {
    setOptions({ ...options, [key]: value, page: 1 });
  };

  /**
   * Since the options can also be updated outside of the `ApplicationsToolbar` (e.g. set the `all` option to `true`,
   * when no applications were found) component we have to update the state everytime the options are changed.
   */
  useEffect(() => {
    setSearchTerm(options.searchTerm ?? '');
  }, [options]);

  return (
    <Toolbar>
      <ToolbarItem>
        <ToggleButtonGroup
          size="small"
          value={options.all}
          exclusive={true}
          onChange={(_, value) => handleChange('all', value ?? false)}
        >
          <ToggleButton sx={{ px: 4 }} value={false}>
            Owned
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value={true}>
            All
          </ToggleButton>
        </ToggleButtonGroup>
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search"
            fullWidth={true}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </ToolbarItem>
      <ToolbarItem width="200px">
        <ResourcesSelectClusters
          selectedClusters={options.clusters ?? []}
          selectClusters={(clusters) => handleChange('clusters', clusters)}
        />
      </ToolbarItem>
      <ToolbarItem width="200px">
        <ResourcesSelectNamespaces
          selectedClusters={options.clusters ?? []}
          selectedNamespaces={options.namespaces ?? []}
          selectNamespaces={(namespaces) => handleChange('namespaces', namespaces)}
        />
      </ToolbarItem>
      <ToolbarItem width="200px">
        <ApplicationsToolbarTags selectedTags={options.tags ?? []} selectTags={(tags) => handleChange('tags', tags)} />
      </ToolbarItem>
    </Toolbar>
  );
};

export default ApplicationsToolbar;
