import { JSONPath } from 'jsonpath-plus';

import { IOptions, TType } from './interfaces';
import { getTimeParams, timeDifference } from '@kobsio/shared';

// getInitialOptions returns the initial options from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const type = params.get('type');
  const cluster = params.get('cluster');
  const namespace = params.get('namespace');

  let parsedType: TType = 'kustomizations';
  if (type && type !== '') {
    parsedType = type as TType;
  }

  return {
    cluster: cluster || '',
    namespace: namespace || '',
    times: getTimeParams(params, isInitial),
    type: parsedType,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValue = (manifest: any, jsonPath: string, type: string): string => {
  const value = JSONPath<string | string[]>({ json: manifest, path: jsonPath })[0];

  if (type === 'boolean') {
    return (value as unknown as boolean) === true ? 'True' : 'False';
  } else if (!value) {
    return '';
  } else if (type === 'date') {
    return timeDifference(new Date().getTime(), new Date(value).getTime());
  } else if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value;
  }
};

export const convertSourceKind = (kind?: string): TType => {
  if (kind === 'GitRepository') {
    return 'gitrepositories';
  }

  if (kind === 'HelmRepository') {
    return 'helmrepositories';
  }

  if (kind === 'Bucket') {
    return 'buckets';
  }

  return 'gitrepositories';
};
