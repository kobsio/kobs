import { IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const jql = params.get('jql');
  const page = params.get('page');
  const perPage = params.get('perPage');

  return {
    jql: jql || '',
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 50,
    times: getTimeParams(params, isInitial),
  };
};

export const getStatusColor = (
  color?: string,
): 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey' | 'gold' | undefined => {
  if (
    color === 'blue' ||
    color === 'cyan' ||
    color === 'green' ||
    color === 'orange' ||
    color === 'purple' ||
    color === 'red' ||
    color === 'grey' ||
    color === 'gold'
  ) {
    return color;
  }

  if ((color = 'yellow')) {
    return 'orange';
  }

  return undefined;
};
