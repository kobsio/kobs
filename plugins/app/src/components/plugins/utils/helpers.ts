import { IOptions } from './interfaces';

export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const page = params.get('page');
  const perPage = params.get('perPage');
  const pluginSatellite = params.get('pluginSatellite');
  const pluginType = params.get('pluginType');
  const searchTerm = params.get('searchTerm');

  return {
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 10,
    pluginSatellite: pluginSatellite || '',
    pluginType: pluginType || '',
    searchTerm: searchTerm || '',
  };
};
