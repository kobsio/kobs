import { Gallery, GalleryItem } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import { IPluginData } from '../../../context/PluginsContext';
import PluginItem from './PluginItem';

export interface IPluginsProps {
  plugins: IPluginData[];
}

const Plugins: React.FunctionComponent<IPluginsProps> = ({ plugins }: IPluginsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  return (
    <Gallery hasGutter={true}>
      {plugins.map(
        (plugin) =>
          authContext.hasPluginAccess(plugin.name) && (
            <GalleryItem key={plugin.name}>
              <PluginItem plugin={plugin} />
            </GalleryItem>
          ),
      )}
    </Gallery>
  );
};

export default Plugins;
