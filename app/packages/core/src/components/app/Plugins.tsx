import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, PluginContext } from '../../context/PluginContext';

const Plugins: FunctionComponent = () => {
  const { getAvailableClusters, getAvailablePluginTypes, instances } = useContext(PluginContext);
  const [clusters, setClusters] = useState<string[]>([]);
  const [pluginTypes, setPluginTypes] = useState<string[]>([]);
  const [search, setSearch] = useState<string>();

  const getPlugins = (): IPluginInstance[] => {
    return instances
      .filter((instance) => (clusters.length ? clusters.includes(instance.cluster) : true))
      .filter((instance) => (pluginTypes.length ? pluginTypes.includes(instance.type) : true))
      .filter((instance) => (search ? instance.name.includes(search) || instance.description?.includes(search) : true));
  };

  return (
    <Box pt={6}>
      <Typography variant="h3" mb={2}>
        Plugins
      </Typography>
      <Typography variant="subtitle1">
        A list of all available plugins, which can be used within your applications, dashboards, teams and users. You
        can also select a plugin to directly interact with the underlying service.
      </Typography>
      <Stack spacing={8} my={6} direction="row">
        <Autocomplete
          multiple={true}
          id="cluster"
          options={getAvailableClusters()}
          getOptionLabel={(option): string => option}
          defaultValue={[]}
          // eslint-disable-next-line @typescript-eslint/naming-convention
          onChange={(_, value): void => setClusters(value)}
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          onChange={(_, value): void => setPluginTypes(value)}
          renderInput={(params): React.ReactNode => (
            <TextField sx={{ minWidth: '320px' }} {...params} id="plugin" label="Plugin" />
          )}
        />
        <TextField
          id="search"
          label="Search"
          sx={{ width: '100%' }}
          onChange={(e): void => setSearch(e.target.value)}
        />
      </Stack>
      <Divider sx={{ my: 6 }} />
      <List>
        {getPlugins().map((item, i) => (
          <ListItem key={i} disablePadding={true}>
            <ListItemButton component={Link} to={'.' + item.id}>
              <ListItemText primary={item.name} secondary={item.description} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Plugins;
