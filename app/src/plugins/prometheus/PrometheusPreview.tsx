import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { IPluginProps } from 'utils/plugins';
import PrometheusPreviewChart from 'plugins/prometheus/PrometheusPreviewChart';

const PrometheusPreview: React.FunctionComponent<IPluginProps> = ({ name, description, plugin }: IPluginProps) => {
  if (
    !plugin.prometheus ||
    plugin.prometheus.chartsList.length !== 1 ||
    plugin.prometheus.chartsList[0].queriesList.length !== 1
  ) {
    return <Alert variant={AlertVariant.danger} isInline={true} title="Prometheus properties are invalid." />;
  }

  return <PrometheusPreviewChart name={name} chart={plugin.prometheus.chartsList[0]} />;
};

export default PrometheusPreview;
