import { IOptions } from './interfaces';

export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const all = params.get('all');
  const clusterIDs = params.getAll('clusterID');
  const external = params.get('external');
  const namespaceIDs = params.getAll('namespaceID');
  const page = params.get('page');
  const perPage = params.get('perPage');
  const searchTerm = params.get('searchTerm');
  const tags = params.getAll('tag');

  return {
    all: all === 'true' ? true : false,
    clusterIDs: clusterIDs,
    external: external || 'include',
    namespaceIDs: namespaceIDs,
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 10,
    searchTerm: searchTerm || '',
    tags: tags,
  };
};
