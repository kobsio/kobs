import { Alert, AlertActionLink, AlertVariant, PageSection } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';

// IPluginParams are the parameters for the PluginPage component. For the PluginPage we only require the name of the
// plugin.
interface IPluginParams {
  name: string;
}

// PluginPage is the component to render the page component for a plugin. The plugin and component is selected from the
// PluginsContext by the name of the plugin. When the plugin name wasn't found (pluginDetails is undefined) or the
// Component is undefined, because the plugin doesn't support pages we render an Alert message.
export const PluginPage: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IPluginParams>();
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(params.name);
  const Component =
    pluginDetails && pluginsContext.components.hasOwnProperty(pluginDetails.type)
      ? pluginsContext.components[pluginDetails.type].page
      : undefined;

  if (!pluginDetails) {
    return (
      <PageSection>
        <Alert
          variant={AlertVariant.danger}
          title="Plugin was not found"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            </React.Fragment>
          }
        >
          <p>
            The plugin <b>{params.name}</b> was not found.
          </p>
        </Alert>
      </PageSection>
    );
  }

  if (!Component) {
    return (
      <PageSection>
        <Alert
          variant={AlertVariant.info}
          title="The Plugin doesn't have a page component"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            </React.Fragment>
          }
        >
          <p>
            The plugin <b>{pluginDetails.displayName}</b> of tpye <b>{pluginDetails.type}</b> does not implements a page
            component.
          </p>
        </Alert>
      </PageSection>
    );
  }

  return (
    <Component
      name={pluginDetails.name}
      displayName={pluginDetails.displayName}
      description={pluginDetails.description}
      options={pluginDetails.options}
    />
  );
};
