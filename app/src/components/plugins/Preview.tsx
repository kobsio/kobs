import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { Plugin as IPlugin } from 'proto/plugins_grpc_web_pb';
import { plugins } from 'utils/plugins';

interface IPreviewProps {
  plugin: IPlugin.AsObject;
}

const Preview: React.FunctionComponent<IPreviewProps> = ({ plugin }: IPreviewProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(plugin.name);

  if (!pluginDetails || !plugins.hasOwnProperty(pluginDetails.type)) {
    return <Alert variant={AlertVariant.danger} isInline={true} title="Plugin was not found." />;
  }

  const Component = plugins[pluginDetails.type].preview;

  if (!Component) {
    return <Alert variant={AlertVariant.danger} isInline={true} title="Plugin doesn't support the preview mode." />;
  }

  return <Component name={plugin.name} description={pluginDetails.description} plugin={plugin} />;
};

export default Preview;
