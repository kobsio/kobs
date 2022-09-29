import React from 'react';

import { IPluginInstance, PluginInstance } from '@kobsio/shared';
import { defaultDescription } from '../../utils/constants';
import icon from '../../assets/icon.png';

// The Instance component is used on the plugins page of kobs. It should return the name, logo and description for a
// plugin instance. You can always use the PluginInstance component from the "@kobsio/shared" package to use the same
// style as the other plugins of kobs.
const Instance: React.FunctionComponent<IPluginInstance> = ({
  satellite,
  name,
  type,
  description,
}: IPluginInstance) => {
  return (
    <PluginInstance
      satellite={satellite}
      name={name}
      type={type}
      description={description || defaultDescription}
      icon={icon}
    />
  );
};

export default Instance;
