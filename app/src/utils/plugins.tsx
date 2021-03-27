import React from 'react';

import ElasticsearchPage from 'plugins/elasticsearch/ElasticsearchPage';
import ElasticsearchPlugin from 'plugins/elasticsearch/ElasticsearchPlugin';
import PrometheusPage from 'plugins/prometheus/PrometheusPage';
import PrometheusPlugin from 'plugins/prometheus/PrometheusPlugin';

import { Plugin as IProtoPlugin } from 'proto/plugins_pb';

// IPluginPageProps is the interface for the properties, which are passed to the page implementation of a plugin. This
// is the name and the description of the plugin.
export interface IPluginPageProps {
  name: string;
  description: string;
}

// IPluginProps is the interface for the properties, which are passed to the plugin implementation of a plugin. This is
// the name and description of the plugin. We also pass the complete plugin structure to this component. The component
// is then responsible to use the correct property from the plugin structure.
export interface IPluginProps {
  isInDrawer: boolean;
  name: string;
  description: string;
  plugin: IProtoPlugin.AsObject;
  showDetails: (panelContent: React.ReactNode) => void;
}

// IPlugin is the interface for a single plugin implementation. Each plugin must implement a plugin component, which can
// be used within an application and a page, which can be used to retrieve data of this plugin withour an application.
export interface IPlugin {
  page: React.FunctionComponent<IPluginPageProps>;
  plugin: React.FunctionComponent<IPluginProps>;
}

// IPlugins is the interface for a list of plugins. The key of this interface is the plugin type and must correspond
// with the type, which is returned when the plugin is registered in the Go code.
export interface IPlugins {
  [key: string]: IPlugin;
}

// plugins is the list of all supported plugins.
export const plugins: IPlugins = {
  elasticsearch: {
    page: ElasticsearchPage,
    plugin: ElasticsearchPlugin,
  },
  prometheus: {
    page: PrometheusPage,
    plugin: PrometheusPlugin,
  },
};
