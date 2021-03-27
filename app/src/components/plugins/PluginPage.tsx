import { Alert, AlertActionLink, AlertVariant, PageSection } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { plugins } from 'utils/plugins';

interface IPluginParams {
  name: string;
}

const PluginPage: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IPluginParams>();
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const pluginDetails = pluginsContext.getPluginDetails(params.name);

  if (!pluginDetails || !plugins.hasOwnProperty(pluginDetails.type)) {
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
          {pluginDetails ? (
            <p>
              The plugin <b>{params.name}</b> has an invalide type.
            </p>
          ) : (
            <p>
              The plugin <b>{params.name}</b> was not found.
            </p>
          )}
        </Alert>
      </PageSection>
    );
  }

  const Component = plugins[pluginDetails.type].page;
  return <Component name={params.name} description={pluginDetails.description} />;
};

export default PluginPage;
