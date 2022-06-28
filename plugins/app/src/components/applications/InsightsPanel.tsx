import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { ITimes, PluginPanel } from '@kobsio/shared';
import Insights from './Insights';

interface IInsightsOptions {
  satellite?: string;
  cluster?: string;
  namespace?: string;
  name?: string;
}

interface IInsightsPanelProps {
  title: string;
  description?: string;
  options?: IInsightsOptions;
  times?: ITimes;
}

const InsightsPanel: React.FunctionComponent<IInsightsPanelProps> = ({
  title,
  description,
  options,
  times,
}: IInsightsPanelProps) => {
  if (options && options.satellite && options.cluster && options.namespace && options.name && times) {
    return (
      <PluginPanel title={title} description={description}>
        <Insights
          satellite={options.satellite}
          cluster={options.cluster}
          namespace={options.namespace}
          name={options.name}
          times={times}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
        The provided options for the <b>insights</b> plugin are invalid.
      </Alert>
    </PluginPanel>
  );
};

export default InsightsPanel;
