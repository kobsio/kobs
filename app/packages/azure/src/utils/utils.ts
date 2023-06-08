export const description = 'The innovate-anywhere, create-anything cloud.';

export const example = `plugin:
  name: azure
  type: azure
  options:
    service: Metrics
    resourceGroup: dev-de1
    provider: Microsoft.ContainerService/managedClusters/dev-de1
    metric: apiserver_current_inflight_requests
    aggregationType: Average`;
