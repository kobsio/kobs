import React from 'react';

import { IPluginInstance, PluginInstance } from '@kobsio/shared';

import { deaultDescription } from '../../utils/constants';
import icon from '../../assets/icon.png';

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
      description={description || deaultDescription}
      icon={icon}
    />
  );
};

export default Instance;
