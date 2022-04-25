import { Alert, AlertVariant, PageSection } from '@patternfly/react-core';
import React from 'react';

const PluginPageError: React.FunctionComponent<{ title: string; children: React.ReactElement }> = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) => {
  return (
    <PageSection>
      <Alert variant={AlertVariant.danger} title={title}>
        {children}
      </Alert>
    </PageSection>
  );
};

export default PluginPageError;
