import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  TabContent,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { Application } from 'proto/application_pb';
import ResourceDetails from 'components/resources/ResourceDetails';
import ResourcesList from 'components/resources/ResourcesList';

interface IApplicationTabsContent {
  application: Application.AsObject;
  activeTab: string;
  isInDrawer: boolean;
  refResourcesContent: React.RefObject<HTMLElement>;
}

// ApplicationTabsContent renders the content of an tab. If the component isn't rendered inside a drawer it provides a
// drawer, so the a component in the tab content can display some details in his own drawer.
const ApplicationTabsContent: React.FunctionComponent<IApplicationTabsContent> = ({
  application,
  activeTab,
  isInDrawer,
  refResourcesContent,
}: IApplicationTabsContent) => {
  const [panelContent, setPanelContent] = useState<React.ReactNode | undefined>(undefined);

  return (
    <Drawer isExpanded={panelContent !== undefined}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <PageSection
            style={isInDrawer ? { minHeight: '100%', paddingLeft: '0px', paddingRight: '0px' } : { minHeight: '100%' }}
            variant={isInDrawer ? PageSectionVariants.light : PageSectionVariants.default}
          >
            <TabContent
              style={{ minHeight: '100%' }}
              eventKey="resources"
              id="refResources"
              activeKey={activeTab}
              ref={refResourcesContent}
              aria-label="Resources"
            >
              <ResourcesList
                resources={{
                  clusters: [application.cluster],
                  namespaces: [application.namespace],
                  resources: application.resourcesList,
                }}
                selectResource={(resource: IRow): void =>
                  isInDrawer
                    ? setPanelContent(undefined)
                    : setPanelContent(
                        <ResourceDetails resource={resource} close={(): void => setPanelContent(undefined)} />,
                      )
                }
              />
            </TabContent>
          </PageSection>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ApplicationTabsContent;
