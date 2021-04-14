// IKialiOptions is the interface for all available options to get the graph from Kiali.
export interface IKialiOptions {
  duration: number;
  namespaces: string[];
}

// getOptionsFromSearch is used to get the Elasticsearch options from a given search location.
export const getOptionsFromSearch = (search: string): IKialiOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');
  const duration = params.get('duration');

  return {
    duration: duration ? parseInt(duration as string) : 60,
    namespaces: namespaces,
  };
};
