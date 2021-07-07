import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginPreviewProps, IPluginsContext, PluginsContext } from '../../context/PluginsContext';

export const PluginPreview: React.FunctionComponent<IPluginPreviewProps> = ({
  times,
  title,
  name,
  options,
}: IPluginPreviewProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(name);
  const Component =
    pluginDetails && pluginsContext.components.hasOwnProperty(pluginDetails.type)
      ? pluginsContext.components[pluginDetails.type].preview
      : undefined;

  if (!pluginDetails || !Component) {
    return (
      <Alert variant={AlertVariant.danger} isInline={true} title="Plugin was not found">
        {pluginDetails ? (
          <p>
            The plugin <b>{pluginDetails.displayName}</b> of tpye <b>{pluginDetails.type}</b> does not implements a
            preview component.
          </p>
        ) : (
          <p>
            The plugin <b>{name}</b> was not found.
          </p>
        )}
      </Alert>
    );
  }

  return <Component times={times} title={title} name={pluginDetails.name} options={options} />;
};
