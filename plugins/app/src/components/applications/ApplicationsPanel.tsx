import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import ApplicationsPanelList from './ApplicationsPanelList';
import { PluginPanel } from '@kobsio/shared';

interface IApplicationsPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationsPanel: React.FunctionComponent<IApplicationsPanelProps> = ({
  title,
  description,
  options,
  setDetails,
}: IApplicationsPanelProps) => {
  if (options && options.team) {
    return (
      <ApplicationsPanelList title={title} description={description} team={options.team} setDetails={setDetails} />
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
        The provided options for the <b>applications</b> plugin are invalid.
      </Alert>
    </PluginPanel>
  );
};

export default ApplicationsPanel;
