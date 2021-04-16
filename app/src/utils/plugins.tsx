import React from 'react';

import ElasticsearchPage from 'plugins/elasticsearch/ElasticsearchPage';
import ElasticsearchPlugin from 'plugins/elasticsearch/ElasticsearchPlugin';
import ElasticsearchPreview from 'plugins/elasticsearch/ElasticsearchPreview';
import JaegerPage from 'plugins/jaeger/JaegerPage';
import JaegerPlugin from 'plugins/jaeger/JaegerPlugin';
import OpsgeniePage from 'plugins/opsgenie/OpsgeniePage';
import OpsgeniePlugin from 'plugins/opsgenie/OpsgeniePlugin';
import PrometheusPage from 'plugins/prometheus/PrometheusPage';
import PrometheusPlugin from 'plugins/prometheus/PrometheusPlugin';
import PrometheusPreview from 'plugins/prometheus/PrometheusPreview';
import { jsonToProto as elasticsearchJsonToProto } from 'plugins/elasticsearch/helpers';
import { jsonToProto as jaegerJsonToProto } from 'plugins/jaeger/helpers';
import { jsonToProto as opsgenieJsonToProto } from 'plugins/opsgenie/helpers';
import { jsonToProto as prometheusJsonToProto } from 'plugins/prometheus/helpers';

import { Plugin as IProtoPlugin } from 'proto/plugins_grpc_web_pb';

// jsonToProto is a simple json to protobuf converter function, which can be used instead of the jsonToProto function
// defined by every plugin. So that we can also try to render the plugin, when it doesn't specify a jsonToProto
// function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
// const jsonToProto = (json: any): IProtoPlugin.AsObject | undefined => {
//   for (const [field] of Object.entries(json)) {
//     if (typeof json[field] === 'object') {
//       if (Array.isArray(json[field])) {
//         json[`${field.toLowerCase()}List`] = jsonToProto(json[field]);
//         delete json[field];
//       } else {
//         if (field.toLowerCase() !== field) {
//           json[field.toLowerCase()] = jsonToProto(json[field]);
//           delete json[field];
//         } else {
//           json[field] = jsonToProto(json[field]);
//         }
//       }
//     } else {
//       if (field.toLowerCase() !== field) {
//         json[field.toLowerCase()] = json[field];
//         delete json[field];
//       }
//     }
//   }

//   return json as IProtoPlugin.AsObject;
// };

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
  name: string;
  description: string;
  plugin: IProtoPlugin.AsObject;
  showDetails?: (panelContent: React.ReactNode) => void;
}

// IPlugin is the interface for a single plugin implementation. Each plugin must implement a plugin component, which can
// be used within an application and a page, which can be used to retrieve data of this plugin withour an application.
export interface IPlugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonToProto: (json: any) => IProtoPlugin.AsObject | undefined;
  page: React.FunctionComponent<IPluginPageProps>;
  plugin: React.FunctionComponent<IPluginProps>;
  preview?: React.FunctionComponent<IPluginProps>;
}

// IPlugins is the interface for a list of plugins. The key of this interface is the plugin type and must correspond
// with the type, which is returned when the plugin is registered in the Go code.
export interface IPlugins {
  [key: string]: IPlugin;
}

// plugins is the list of all supported plugins.
export const plugins: IPlugins = {
  elasticsearch: {
    jsonToProto: elasticsearchJsonToProto,
    page: ElasticsearchPage,
    plugin: ElasticsearchPlugin,
    preview: ElasticsearchPreview,
  },
  jaeger: {
    jsonToProto: jaegerJsonToProto,
    page: JaegerPage,
    plugin: JaegerPlugin,
  },
  opsgenie: {
    jsonToProto: opsgenieJsonToProto,
    page: OpsgeniePage,
    plugin: OpsgeniePlugin,
  },
  prometheus: {
    jsonToProto: prometheusJsonToProto,
    page: PrometheusPage,
    plugin: PrometheusPlugin,
    preview: PrometheusPreview,
  },
};
