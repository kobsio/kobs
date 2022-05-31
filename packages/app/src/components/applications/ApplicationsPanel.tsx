import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import ApplicationsPanelList from './ApplicationsPanelList';

interface IApplicationsPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationsPanel: React.FunctionComponent<IApplicationsPanelProps> = ({
  options,
  setDetails,
}: IApplicationsPanelProps) => {
  if (options && options.team) {
    return <ApplicationsPanelList team={options.team} setDetails={setDetails} />;
  }

  return (
    <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
      The provided options for the <b>applications</b> plugin are invalid.
    </Alert>
  );
};

export default ApplicationsPanel;
