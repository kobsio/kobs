import { V1LabelSelector } from '@kubernetes/client-node';

import { IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const clusterIDs = params.getAll('clusterID');
  const namespaceIDs = params.getAll('namespaceID');
  const resourceIDs = params.getAll('resourceID');
  const param = params.get('param');
  const paramName = params.get('paramName');

  return {
    clusterIDs: clusterIDs,
    namespaceIDs: namespaceIDs,
    param: param || '',
    paramName: paramName || '',
    resourceIDs: resourceIDs,
    times: getTimeParams(params, isInitial),
  };
};

// getLabelSelector returns the given label selector as string, so that it can be used within the React UI.
export const getLabelSelector = (labelSelector: V1LabelSelector | undefined): string => {
  if (!labelSelector) {
    return '';
  }

  if (labelSelector.matchLabels) {
    return Object.keys(labelSelector.matchLabels)
      .map(
        (key) =>
          `${key}=${
            labelSelector.matchLabels && key in labelSelector.matchLabels ? labelSelector.matchLabels[key] : ''
          }`,
      )
      .join(', ');
  }

  return '';
};

// formatResourceValue converts the given value for CPU, memory or ephemeral storage to another unit.
export const formatResourceValue = (type: string, value: string): string => {
  if (value === '' || value === undefined) {
    return '';
  }

  if (type === 'cpu') {
    if (value.slice(-1) === 'm') {
      return value;
    }

    if (value.slice(-1) === 'n') {
      return Math.round(parseInt(value.slice(0, -1)) / 1000000) + 'm';
    }

    return parseInt(value) * 1000 + 'm';
  }

  if (type === 'memory') {
    if (value.slice(-2) === 'Ki') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024) + 'Mi';
    }

    if (value.slice(-2) === 'Mi') {
      return value;
    }

    if (value.slice(-2) === 'Gi') {
      return Math.round(parseInt(value.slice(0, -2)) * 1024) + 'Mi';
    }

    return value;
  }

  if (type === 'ephemeral-storage') {
    if (value.slice(-2) === 'Ki') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024 / 1024) + 'Gi';
    }

    if (value.slice(-2) === 'Mi') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024) + 'Gi';
    }

    if (value.slice(-2) === 'Gi') {
      return value;
    }

    return Math.round(parseInt(value) / 1024 / 1024 / 1024) + 'Gi';
  }

  return value;
};
