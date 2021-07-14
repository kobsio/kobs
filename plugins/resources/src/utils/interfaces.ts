// IPanelOptions is the interface for the options property in the plugin panel implementation for the resources plugin.
// It contains a list of clusters, namespaces, resources and a selector. Since the data is provided by a user and not
// validated by the Kubernetes API server we have to verify that all required fields are present.
export interface IPanelOptions {
  clusters?: string[];
  namespaces?: string[];
  resources?: string[];
  selector?: string;
}
