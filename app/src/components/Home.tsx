import { Gallery, GalleryItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { IPluginsContext, PluginsContext } from 'context/PluginsContext';
import { applicationsDescription, resourcesDescription } from 'utils/constants';
import HomeItem from 'components/HomeItem';

// Home is the root component of kobs. It is used to render a list of pages, which can be used by the user. The items
// which are displayed to the user are the applications and resources page and a list of all configured plugins.
// The items for the gallery should always use the HomeItem component, this will render a card, which are selectable. By
// a click on the item the user is navigated to the corresponding page.
const Home: React.FunctionComponent = () => {
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Gallery hasGutter={true}>
        <GalleryItem>
          <HomeItem
            title="Applications"
            body={applicationsDescription}
            link="/applications"
            icon="/img/plugins/kobs.png"
          />
        </GalleryItem>
        <GalleryItem>
          <HomeItem
            title="Resources"
            body={resourcesDescription}
            link="/resources"
            icon="/img/plugins/kubernetes.png"
          />
        </GalleryItem>

        {pluginsContext.plugins.length === 0 ? (
          <GalleryItem>
            <HomeItem
              title="Plugins"
              body="Plugins can be used to extend the kobs. Click on this card to find out more about plugin."
              link="https://kobs.io"
              icon="/img/plugins/plugins.png"
            />
          </GalleryItem>
        ) : (
          pluginsContext.plugins.map((plugin, index) => (
            <GalleryItem key={index}>
              <HomeItem
                title={plugin.name}
                body={plugin.description}
                link={`/plugins/${plugin.name}`}
                icon={`/img/plugins/${plugin.type}.png`}
              />
            </GalleryItem>
          ))
        )}
      </Gallery>
    </PageSection>
  );
};

export default Home;
