import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { ITimes, PluginPanel as SharedPluginPanel } from '@kobsio/shared';

interface IAppPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  satellite: string;
  name: string;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const AppPanel: React.FunctionComponent<IAppPanelProps> = ({
  title,
  description,
  satellite,
  name,
  options,
  times,
  setDetails,
}: IAppPanelProps) => {
  if (name === '') {
    return null;
  }

  return (
    <SharedPluginPanel title={title} description={description}>
      <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin name">
        The plugin name <b>{name}</b> is invalid for the plugin type <b>app</b>.
      </Alert>
    </SharedPluginPanel>
  );
};

export default AppPanel;
