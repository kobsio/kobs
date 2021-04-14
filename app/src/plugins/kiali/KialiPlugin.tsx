import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { IPluginProps } from 'utils/plugins';

const KialiPlugin: React.FunctionComponent<IPluginProps> = ({
  name,
  description,
  plugin,
  showDetails,
}: IPluginProps) => {
  return (
    <Alert variant={AlertVariant.warning} title="Beta">
      <p>
        The Kiali plugin is currently in development and is not yet supported as a plugin for Applications, Teams or
        other resources.
      </p>
    </Alert>
  );
};

export default KialiPlugin;
