import { V1LabelSelector } from '@kubernetes/client-node';

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
            labelSelector.matchLabels && labelSelector.matchLabels.hasOwnProperty(key)
              ? labelSelector.matchLabels[key]
              : ''
          }`,
      )
      .join(', ');
  }

  return '';
};
