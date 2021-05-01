import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { Plugin as IPlugin } from 'proto/plugins_grpc_web_pb';
import { plugins } from 'utils/plugins';

interface IPluginProps {
  plugin?: IPlugin.AsObject;
  showDetails?: (panelContent: React.ReactNode) => void;
}

const Plugin: React.FunctionComponent<IPluginProps> = ({ plugin, showDetails }: IPluginProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = plugin ? pluginsContext.getPluginDetails(plugin.name) : undefined;

  if (!plugin || !pluginDetails || !plugins.hasOwnProperty(pluginDetails.type)) {
    return (
      <Alert variant={AlertVariant.danger} title="Plugin was not found">
        {!plugin ? (
          <p>The plugin was not found.</p>
        ) : pluginDetails ? (
          <p>
            The plugin <b>{plugin.name}</b> has an invalide type.
          </p>
        ) : (
          <p>
            The plugin <b>{plugin.name}</b> was not found.
          </p>
        )}
      </Alert>
    );
  }

  const Component = plugins[pluginDetails.type].plugin;

  return (
    <Component name={plugin.name} description={pluginDetails.description} plugin={plugin} showDetails={showDetails} />
  );
};

export default Plugin;
