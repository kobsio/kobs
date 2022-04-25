import React from 'react';

import { IPluginInstance, PluginInstance } from '@kobsio/shared';

import { deaultDescription } from '../../utils/constants';
import icon from '../../assets/icon.png';

const Instance: React.FunctionComponent<IPluginInstance> = ({ name, type, description }: IPluginInstance) => {
  return <PluginInstance name={name} type={type} description={description || deaultDescription} icon={icon} />;
};

export default Instance;
