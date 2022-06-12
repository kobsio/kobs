import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import Module from '../module/Module';
import PluginPageError from './PluginPageError';
import PluginPageLoading from './PluginPageLoading';

const PluginPage: React.FunctionComponent = () => {
  const params = useParams<{ satellite: string; type: string; name: string }>();
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);
  const instance = pluginsContext.getInstance(params.satellite || '', params.type || '', params.name || '');

  if (!instance) {
    return (
      <PluginPageError title="Plugin instance was not found">
        <p>
          The plugin instance with the name <b>{params.name}</b> and the type <b>{params.type}</b> was not found
        </p>
      </PluginPageError>
    );
  }

  return (
    <Module
      name={instance.type}
      module="./Page"
      props={{ instance: instance }}
      errorContent={PluginPageError}
      loadingContent={PluginPageLoading}
    />
  );
};

export default PluginPage;
