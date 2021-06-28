import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { PluginCard } from './PluginCard';

interface IPluginOptionsMissingProps {
  title: string;
  message: string;
  details: string;
  documentation: string;
}

// PluginOptionsMissing is the component, which is displayed when the user defines a plugin in a Team or an Application,
// but the options for the plugin are missing or invalid It contains the panel title, an error message, a detailed
// description for the error and a link to the corresponding documentation.
export const PluginOptionsMissing: React.FunctionComponent<IPluginOptionsMissingProps> = ({
  title,
  message,
  details,
  documentation,
}: IPluginOptionsMissingProps) => {
  return (
    <PluginCard title={title}>
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
    </PluginCard>
  );
};
