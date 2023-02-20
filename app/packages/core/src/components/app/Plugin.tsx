import { Box } from '@mui/material';
import { FunctionComponent, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PluginContext } from '../../context/PluginContext';

const Plugin: FunctionComponent = () => {
  const params = useParams();
  const { getInstance, getPlugin } = useContext(PluginContext);
  const cluster = params['cluster'];
  const pluginType = params['type'];
  const pluginID = params['id'];
  const instance = pluginID ? getInstance(`/cluster/${cluster}/type/${pluginType}/name/${pluginID}`) : undefined;
  const Page = instance ? getPlugin(instance.type)?.page : undefined;

  return <Box pt={6}>{Page && instance && <Page instance={instance} />}</Box>;
};

export default Plugin;
