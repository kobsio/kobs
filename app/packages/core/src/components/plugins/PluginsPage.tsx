import { CheckBox, CheckBoxOutlineBlank, Extension, Search } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { FormEvent, FunctionComponent, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, PluginContext } from '../../context/PluginContext';
import { useLocalStorageState } from '../../utils/hooks/useLocalStorageState';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';
import { Pagination } from '../utils/Pagination';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

/**
 * The `IOptions` represents all options which can be set by a user on the plugins page.
 */
interface IOptions {
  clusters: string[];
  page: number;
  perPage: number;
  pluginTypes: string[];
  searchTerm: string;
}

/**
 * The `PluginsPage` renders a galary of the available plugins and allows users to filter plugins by cluster,
 * plugin-type and a search term.
 */
const PluginsPage: FunctionComponent = () => {
  const { getClusters, getPluginTypes, getPlugin, instances } = useContext(PluginContext);

  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IOptions>('kobs-core-pluginspage-options', {
    clusters: [],
    page: 1,
    perPage: 10,
    pluginTypes: [],
    searchTerm: '',
  });
  const [options, setOptions] = useQueryState<IOptions>(() => persistedOptions);
  const [searchTerm, setSearchTerm] = useState<string>(options.searchTerm ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions((prevOptions) => ({ ...prevOptions, page: 1, searchTerm: searchTerm }));
  };

  const filteredItems = instances
    .filter((instance) => (options.clusters.length ? options.clusters.includes(instance.cluster) : true))
    .filter((instance) => (options.pluginTypes.length ? options.pluginTypes.includes(instance.type) : true))
    .filter((instance) =>
      options.searchTerm
        ? instance.name.includes(options.searchTerm) || instance.description?.includes(options.searchTerm)
        : true,
    );

  const items = filteredItems.slice((options.page - 1) * options.perPage, options.page * options.perPage);

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title="Plugins"
      description="A list of all available plugins, which can be used within your applications, dashboards, teams and users. You can also select a plugin to directly to interact with the underlying service."
      toolbar={
        <Toolbar>
          <ToolbarItem width="200px">
            <Autocomplete
              size="small"
              multiple={true}
              disableCloseOnSelect={true}
              options={getClusters()}
              getOptionLabel={(option) => option ?? ''}
              value={options.clusters}
              onChange={(e, value) => setOptions((prevOptions) => ({ ...prevOptions, clusters: value, page: 1 }))}
              renderTags={(value) => <Chip size="small" label={value.length} />}
              renderOption={(props, option, { selected }) => (
                <li {...props} style={{ padding: 1 }}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {option}
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Clusters" placeholder="Clusters" />}
            />
          </ToolbarItem>
          <ToolbarItem width="200px">
            <Autocomplete
              size="small"
              multiple={true}
              disableCloseOnSelect={true}
              options={getPluginTypes()}
              getOptionLabel={(option) => option ?? ''}
              value={options.pluginTypes}
              onChange={(e, value) => setOptions((prevOptions) => ({ ...prevOptions, page: 1, pluginTypes: value }))}
              renderTags={(value) => <Chip size="small" label={value.length} />}
              renderOption={(props, option, { selected }) => (
                <li {...props} style={{ padding: 1 }}>
                  <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                  {option}
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Plugin Types" placeholder="Plugin Types" />}
            />
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
        </Toolbar>
      }
    >
      <Grid container={true} spacing={6}>
        <Grid item={true} xs={12} lg={12}>
          <Grid container={true} spacing={6}>
            {items.map((item) => (
              <Grid key={item.id} item={true} xs={12} sm={6} md={3} lg={3} xl={3}>
                <Card>
                  <CardActionArea component={Link} to={`./${item.cluster}/${item.type}/${item.name}`}>
                    <CardContent sx={{ p: 6 }}>
                      {((instance: IPluginInstance) => {
                        const plugin = getPlugin(instance.type);
                        const icon = plugin?.icon;

                        return (
                          <Stack spacing={8}>
                            <Stack direction="row" justifyContent="center">
                              {!icon ? (
                                <Extension sx={{ fontSize: 64 }} />
                              ) : (
                                <CardMedia
                                  sx={{ height: 64, width: 64 }}
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  image={icon as any}
                                  title={`${instance.name}-icon`}
                                />
                              )}
                            </Stack>
                            <Box textAlign="center">
                              <Typography variant="h6">{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({item.cluster} / {item.type})
                              </Typography>
                            </Box>
                            <Typography textAlign="center">
                              {item.description ? item.description : plugin?.description}
                            </Typography>
                          </Stack>
                        );
                      })(item)}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Pagination
        page={options.page}
        perPage={options.perPage}
        count={filteredItems.length}
        handleChange={(page, perPage) =>
          setOptions((prevOptions) => ({ ...prevOptions, page: page, perPage: perPage }))
        }
      />
    </Page>
  );
};

export default PluginsPage;
