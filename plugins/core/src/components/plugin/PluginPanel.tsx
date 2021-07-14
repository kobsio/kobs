import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginPanelProps, IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import { PluginCard } from './PluginCard';

// PluginPanel is the component which is used by a dashboard to render the panel for a plugin. The components looks for
// the provided plugin name and renders the corresponding panel component of the plugin. Besides the plugin name the
// component also requires the panel title, description and options. The defaults property should be the cluster,
// namespace and name of the Team/Application where the dashboard is currently shown, so that a user can omit the
// clusters and namespaces property in the CR.
export const PluginPanel: React.FunctionComponent<IPluginPanelProps> = ({
  defaults,
  times,
  name,
  title,
  description,
  options,
  showDetails,
}: IPluginPanelProps) => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(name);
  const Component =
    pluginDetails && pluginsContext.components.hasOwnProperty(pluginDetails.type)
      ? pluginsContext.components[pluginDetails.type].panel
      : undefined;

  if (!pluginDetails || !Component) {
    return (
      <PluginCard title={title} description={description}>
        <Alert variant={AlertVariant.danger} title="Plugin was not found">
          {pluginDetails ? (
            <p>
              The plugin <b>{pluginDetails.displayName}</b> of tpye <b>{pluginDetails.type}</b> does not implements a
              page component.
            </p>
          ) : (
            <p>
              The plugin <b>{name}</b> was not found.
            </p>
          )}
        </Alert>
      </PluginCard>
    );
  }

  return (
    <Component
      defaults={defaults}
      times={times}
      name={pluginDetails.name}
      title={title}
      description={description}
      options={options}
      showDetails={showDetails}
    />
  );
};
