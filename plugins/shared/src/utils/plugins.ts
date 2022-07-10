import { ITimes } from './times';

// IPluginInstanceOptions contains a list of options for the configured plugin instance. This allows us to set options
// for a plugin via the configuration file, and to use them in the frontend.
export interface IPluginInstanceOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// IPluginInstance represents a single instance for a plugin. It contains the name of the instances as well as the
// configured options.
export interface IPluginInstance {
  id: string;
  satellite: string;
  type: string;
  name: string;
  description?: string;
  options?: IPluginInstanceOptions;
  updatedAt: number;
}

// IPluginPageProps are the properties for the page component of each plugin. This interface must be implemented by all
// plugins. It only contains all the instances for a specific plugin.
export interface IPluginPageProps {
  instance: IPluginInstance;
}

// IPluginPanelProps is the interface for the panel component of each plugin. It contains the user provided values for
// the title of the panel, an optional description and the options for the plugin panel.
//
// Next to this we also pass the instance to the panel. The instance is determined based on the provided "name" property
// in the CR or the default instance for this specific plugin type. We also need the selected time range in the plugin
// panels and an optional setDetails function to allow plugins to open a Drawer to display additional information.
export interface IPluginPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  instance: IPluginInstance;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

export interface IPluginNotificationsProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  instance: IPluginInstance;
  times: ITimes;
}

export const pluginBasePath = (instance: IPluginInstance): string => {
  return `/plugins/${encodeURIComponent(instance.satellite)}/${encodeURIComponent(instance.type)}/${encodeURIComponent(
    instance.name,
  )}`;
};

export const pluginBasePathAlt = (satellite: string, type: string, name: string): string => {
  return `/plugins/${encodeURIComponent(satellite)}/${encodeURIComponent(type)}/${encodeURIComponent(name)}`;
};
