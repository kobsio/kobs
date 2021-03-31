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
import Plugin from 'components/plugins/Plugin';
import ResourceDetails from 'components/resources/ResourceDetails';
import ResourcesList from 'components/resources/ResourcesList';

// IMountedTabs is the interface, which is used in an object, which represents all mounted tabs. With this we can
// implement the "mountOnEnter" function from Patternfly for our tabs setup, because this function doesn't work when,
// the TabsContent component is used outside of the Tabs component.
export interface IMountedTabs {
  [key: string]: boolean;
}

interface IApplicationTabsContent {
  application: Application.AsObject;
  activeTab: string;
  mountedTabs: IMountedTabs;
  isInDrawer: boolean;
  refResourcesContent: React.RefObject<HTMLElement>;
  refPluginsContent: React.RefObject<HTMLElement>[] | undefined;
}

// ApplicationTabsContent renders the content of an tab. If the component isn't rendered inside a drawer it provides a
// drawer, so the a component in the tab content can display some details in his own drawer.
const ApplicationTabsContent: React.FunctionComponent<IApplicationTabsContent> = ({
  application,
  activeTab,
  mountedTabs,
  isInDrawer,
  refResourcesContent,
  refPluginsContent,
}: IApplicationTabsContent) => {
  const [panelContent, setPanelContent] = useState<React.ReactNode | undefined>(undefined);

  const pageSection = (
    <PageSection
      style={{ minHeight: '100%' }}
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
          selectResource={
            isInDrawer
              ? undefined
              : (resource: IRow): void =>
                  setPanelContent(
                    <ResourceDetails resource={resource} close={(): void => setPanelContent(undefined)} />,
                  )
          }
        />
      </TabContent>

      {application.pluginsList.map((plugin, index) => (
        <TabContent
          key={index}
          eventKey={`refPlugin-${index}`}
          id={`refPlugin-${index}`}
          activeKey={activeTab}
          ref={refPluginsContent && refPluginsContent[index] ? refPluginsContent[index] : undefined}
          hidden={true}
          aria-label={plugin.name}
        >
          <div>
            {mountedTabs[`refPlugin-${index}`] ? (
              <Plugin
                plugin={plugin}
                showDetails={isInDrawer ? undefined : (details: React.ReactNode): void => setPanelContent(details)}
              />
            ) : null}
          </div>
        </TabContent>
      ))}
    </PageSection>
  );

  // When the pageSection component is rendered within a drawer, we do not add the additional drawer for the resources
  // and plugins, to avoid the ugly scrolling behavior for the drawer in drawer setup.
  if (isInDrawer) {
    return pageSection;
  }

  // The pageSection isn't rendered within a drawer, so that we add one. This allows a user to show some additional data
  // within the drawer panel.
  return (
    <Drawer isExpanded={panelContent !== undefined}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>{pageSection}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ApplicationTabsContent;
