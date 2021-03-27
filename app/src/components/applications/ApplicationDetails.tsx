import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  List,
  ListItem,
  ListVariant,
} from '@patternfly/react-core';
import React, { createRef, useEffect, useRef, useState } from 'react';

import ApplicationTabsContent, { IMountedTabs } from 'components/applications/ApplicationTabsContent';
import { Application } from 'proto/application_pb';
import ApplicationDetailsLink from 'components/applications/ApplicationDetailsLink';
import ApplicationTabs from 'components/applications/ApplicationTabs';
import Title from 'components/Title';

interface IApplicationDetailsProps {
  application: Application.AsObject;
  close: () => void;
}

// ApplicationDetails is the details view of an application, which is displayed as a drawer panel.
const ApplicationDetails: React.FunctionComponent<IApplicationDetailsProps> = ({
  application,
  close,
}: IApplicationDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('resources');
  const [mountedTabs, setMountedTabs] = useState<IMountedTabs>({});
  const refResourcesContent = useRef<HTMLElement>(null);
  const [refPluginsContent, setRefPluginsContent] = useState<React.RefObject<HTMLElement>[]>(
    application.pluginsList.map(() => createRef<HTMLElement>()),
  );

  // changeActiveTab sets the active tab and adds the name of the selected tab to the mountedTabs object. This object is
  // used to only load data, when a component is mounted the first time.
  const changeActiveTab = (tab: string): void => {
    setActiveTab(tab);
    setMountedTabs({ ...mountedTabs, [tab]: true });
  };

  useEffect(() => {
    setRefPluginsContent(application.pluginsList.map(() => createRef<HTMLElement>()));
  }, [application.pluginsList]);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={application.name} subtitle={`${application.namespace} (${application.cluster})`} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {application.details ? (
          <div>
            <p>{application.details.description}</p>

            <List variant={ListVariant.inline}>
              <ListItem>
                <ApplicationDetailsLink application={application} />
              </ListItem>
              {application.details.linksList.map((link, index) => (
                <ListItem key={index}>
                  <a href={link.link} rel="noreferrer" target="_blank">
                    {link.title}
                  </a>
                </ListItem>
              ))}
            </List>
          </div>
        ) : null}

        <ApplicationTabs
          activeTab={activeTab}
          setTab={changeActiveTab}
          plugins={application.pluginsList}
          refResourcesContent={refResourcesContent}
          refPluginsContent={refPluginsContent}
        />

        <ApplicationTabsContent
          application={application}
          activeTab={activeTab}
          mountedTabs={mountedTabs}
          isInDrawer={true}
          refResourcesContent={refResourcesContent}
          refPluginsContent={refPluginsContent}
        />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ApplicationDetails;
