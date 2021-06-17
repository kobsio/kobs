import { Gallery, GalleryItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from '../../context/PluginsContext';
import HomeItem from './HomeItem';

// HomePage renders a list of all registered plugin instances via the HomeItem component.
const HomePage: React.FunctionComponent = () => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Gallery hasGutter={true}>
        {pluginsContext.plugins.map((plugin) => (
          <GalleryItem key={plugin.name}>
            <HomeItem plugin={plugin} />
          </GalleryItem>
        ))}
      </Gallery>
    </PageSection>
  );
};

export default HomePage;
