import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { Plugin as IPlugin } from 'proto/plugins_grpc_web_pb';
import { plugins } from 'utils/plugins';

interface IPluginProps {
  isInDrawer: boolean;
  plugin: IPlugin.AsObject;
  showDetails: (panelContent: React.ReactNode) => void;
}

const Plugin: React.FunctionComponent<IPluginProps> = ({ isInDrawer, plugin, showDetails }: IPluginProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(plugin.name);

  if (!pluginDetails || !plugins.hasOwnProperty(pluginDetails.type)) {
    return (
      <Alert variant={AlertVariant.danger} isInline={isInDrawer} title="Plugin was not found">
        {pluginDetails ? (
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
    <Component
      isInDrawer={isInDrawer}
      name={plugin.name}
      description={pluginDetails.description}
      plugin={plugin}
      showDetails={showDetails}
    />
  );
};

export default Plugin;
