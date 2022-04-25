import { Alert, AlertVariant, Card } from '@patternfly/react-core';
import React from 'react';

const PluginInstancesError: React.FunctionComponent<{ title: string; children: React.ReactElement }> = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) => {
  return (
    <Card isHoverable={true} isCompact={true}>
      <Alert style={{ height: '100%', width: '100%' }} isInline={true} variant={AlertVariant.danger} title={title}>
        {children}
      </Alert>
    </Card>
  );
};

export default PluginInstancesError;
