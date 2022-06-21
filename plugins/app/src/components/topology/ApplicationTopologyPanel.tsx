import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import ApplicationTopology from './ApplicationTopology';
import { IPanelOptions } from './utils/interfaces';
import { PluginPanel } from '@kobsio/shared';

interface IApplicationTopologyPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: IPanelOptions;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationTopologyPanel: React.FunctionComponent<IApplicationTopologyPanelProps> = ({
  title,
  description,
  options,
  setDetails,
}: IApplicationTopologyPanelProps) => {
  if (options && options.satellite && options.cluster && options.namespace && options.name) {
    return (
      <PluginPanel title={title} description={description}>
        <ApplicationTopology
          satellite={options.satellite}
          cluster={options.cluster}
          namespace={options.namespace}
          name={options.name}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
        The provided options for the <b>topology</b> plugin are invalid.
      </Alert>
    </PluginPanel>
  );
};

export default ApplicationTopologyPanel;
