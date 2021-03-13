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
import { Link } from 'react-router-dom';

import Tabs, { DEFAULT_TAB } from 'components/applications/details/Tabs';
import { Application } from 'generated/proto/application_pb';
import DetailsLink from 'components/applications/details/DetailsLink';
import TabsContent from 'components/applications/details/TabsContent';
import Title from 'components/shared/Title';

interface IDrawerPanelProps {
  application: Application;
  close: () => void;
}

// DrawerPanel is the drawer panel for an application. It is used to display application details in the applications
// page. The details contains information for resources, metrics, logs and traces.
const DrawerPanel: React.FunctionComponent<IDrawerPanelProps> = ({ application, close }: IDrawerPanelProps) => {
  const [tab, setTab] = useState<string>(DEFAULT_TAB);
  const refResourcesContent = useRef<HTMLElement>(null);
  const refMetricsContent = useRef<HTMLElement>(null);
  const refLogsContent = useRef<HTMLElement>(null);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={application.getName()}
          subtitle={`${application.getNamespace()} (${application.getCluster()})`}
          size="lg"
        />
        <DrawerActions className="kobs-drawer-actions">
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobs-drawer-panel-body">
        <List variant={ListVariant.inline}>
          <ListItem>
            <DetailsLink application={application} />
          </ListItem>
          {application.getLinksList().map((link, index) => (
            <ListItem key={index}>
              <Link target="_blank" to={link.getLink}>
                {link.getTitle()}
              </Link>
            </ListItem>
          ))}
        </List>

        <Tabs
          tab={tab}
          setTab={(t: string): void => setTab(t)}
          refResourcesContent={refResourcesContent}
          refMetricsContent={refMetricsContent}
          refLogsContent={refLogsContent}
        />

        <TabsContent
          application={application}
          tab={tab}
          refResourcesContent={refResourcesContent}
          refMetricsContent={refMetricsContent}
          refLogsContent={refLogsContent}
        />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DrawerPanel;
