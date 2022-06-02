import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { PluginPanel } from './PluginPanel';

interface IPluginPanelErrorProps {
  title: string;
  description?: string;
  message: string;
  details: string;
  documentation: string;
}

export const PluginPanelError: React.FunctionComponent<IPluginPanelErrorProps> = ({
  title,
  description,
  message,
  details,
  documentation,
}: IPluginPanelErrorProps) => {
  return (
    <PluginPanel title={title} description={description}>
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title={message}
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Window | null => window.open(documentation, '_blank')}>
              Documentation
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{details}</p>
      </Alert>
    </PluginPanel>
  );
};
