import { Extension } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, PluginContext } from '../../context/PluginContext';
import useQueryState from '../../utils/hooks/useQueryState';

interface IOptions {
  clusters: string[];
  page: number;
  perPage: number;
  pluginTypes: string[];
  search: string;
}

const defaultOptions: IOptions = {
  clusters: [],
  page: 1,
  perPage: 8,
  pluginTypes: [],
  search: '',
};

/**
 * Plugins renders a galary of the available plugins
 * the component allows users to filter plugins by cluster, plugin-type and search
 */
const Plugins: FunctionComponent = () => {
  const {
    getClusters: getAvailableClusters,
    getPluginTypes: getAvailablePluginTypes,
    getPlugin,
    instances,
  } = useContext(PluginContext);
  const [searchOptions, setSearchOptions] = useQueryState<IOptions>();
  const options: IOptions = {
    ...defaultOptions,
    ...searchOptions,
  };

  const handleChange = (update: Partial<IOptions>) => {
    setSearchOptions({ ...options, ...update });
  };

  const filteredItems = instances
    .filter((instance) => (options.clusters.length ? options.clusters.includes(instance.cluster) : true))
    .filter((instance) => (options.pluginTypes.length ? options.pluginTypes.includes(instance.type) : true))
    .filter((instance) =>
      options.search ? instance.name.includes(options.search) || instance.description?.includes(options.search) : true,
    );

  const pages = Math.ceil(filteredItems.length / options.perPage);
  const items = filteredItems.slice((options.page - 1) * options.perPage, options.page * options.perPage);

  return (
    <Stack minHeight="100%" minWidth="100%" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Box pt={6} minWidth="100%">
        <Typography variant="h3" mb={2}>
          Plugins
        </Typography>
        <Typography variant="subtitle1" mb={4}>
          A list of all available plugins, which can be used within your applications, dashboards, teams and users. You
          can also select a plugin to directly interact with the underlying service.
        </Typography>
        <Stack direction={{ lg: 'row', xs: 'column' }} spacing={{ lg: 4, xs: 2 }}>
          <Autocomplete
            multiple={true}
            id="cluster"
            options={getAvailableClusters()}
            getOptionLabel={(option): string => option}
            defaultValue={[]}
            value={options.clusters}
            size="small"
            onChange={(e, value): void => handleChange({ clusters: value, page: 1 })}
            renderInput={(params): React.ReactNode => (
              <TextField sx={{ minWidth: '320px' }} {...params} id="cluster" label="Cluster" />
            )}
          />
          <Autocomplete
            multiple={true}
            id="plugin"
            options={getAvailablePluginTypes()}
            getOptionLabel={(option): string => option}
            defaultValue={[]}
            value={options.pluginTypes}
            size="small"
            onChange={(e, value): void => handleChange({ page: 1, pluginTypes: value })}
            renderInput={(params): React.ReactNode => (
              <TextField sx={{ minWidth: '320px' }} {...params} id="plugin" label="Plugin" />
            )}
          />
          <TextField
            id="search"
            label="Search"
            sx={{ width: '100%' }}
            size="small"
            onChange={(e): void => {
              handleChange({ page: 1, search: e.target.value });
            }}
          />
        </Stack>
        <Divider sx={{ my: 6 }} />

        <Grid container={true} spacing={6}>
          <Grid item={true} xs={12} lg={12}>
            <Grid container={true} spacing={6}>
              {items.map((item) => (
                <Grid key={item.id} item={true} xs={12} sm={6} md={3} lg={3} xl={3}>
                  <Card>
                    <CardActionArea component={Link} to={`./${item.cluster}/${item.type}/${item.name}`}>
                      <CardContent sx={{ p: 6 }}>
                        <Stack spacing={8}>
                          <Stack direction="row" justifyContent="center">
                            {((instance: IPluginInstance) => {
                              const icon = getPlugin(instance.type)?.icon;
                              if (!icon) {
                                return <Extension sx={{ fontSize: 64 }} />;
                              }
                              return (
                                <CardMedia
                                  sx={{ height: 64, width: 64 }}
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  image={icon as any}
                                  title={`${instance.name}-icon`}
                                />
                              );
                            })(item)}
                          </Stack>
                          <Typography variant="h6" mb={6} textAlign="center">
                            {item.name}
                          </Typography>
                          <Typography textAlign="center">{item.description}</Typography>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Stack direction="row" justifyContent="flex-end" minWidth="100%" spacing={4}>
        <Select
          id="per-page-select"
          onChange={(e): void => handleChange({ page: 1, perPage: Number(e.target.value) })}
          value={options.perPage}
          variant="standard"
        >
          {[8, 16, 64, 128].map((i) => (
            <MenuItem key={i} value={i}>
              {i} per page
            </MenuItem>
          ))}
        </Select>
        <Pagination
          count={pages}
          page={options.page}
          onChange={(e, value): void => {
            handleChange({ page: value });
          }}
        />
      </Stack>
    </Stack>
  );
};

export default Plugins;
