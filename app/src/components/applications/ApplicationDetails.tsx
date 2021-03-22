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
import React, { useRef, useState } from 'react';

import { Application } from 'proto/application_pb';
import ApplicationDetailsLink from 'components/applications/ApplicationDetailsLink';
import ApplicationTabs from 'components/applications/ApplicationTabs';
import ApplicationTabsContent from 'components/applications/ApplicationTabsContent';
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
  const refResourcesContent = useRef<HTMLElement>(null);

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
        <ApplicationTabs activeTab={activeTab} setTab={setActiveTab} refResourcesContent={refResourcesContent} />
        <ApplicationTabsContent
          application={application}
          activeTab={activeTab}
          isInDrawer={true}
          refResourcesContent={refResourcesContent}
        />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ApplicationDetails;
