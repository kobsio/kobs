import { IOptions, TView } from './interfaces';
import { getTimeParams } from '@kobsio/plugin-core';

// getInitialOptions returns the initial options for the applications page from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');
  const view = params.get('view');

  return {
    clusters: clusters,
    namespaces: namespaces,
    times: getTimeParams(params, isInitial),
    view: view ? (view as TView) : 'gallery',
  };
};
