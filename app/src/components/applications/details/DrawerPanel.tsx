import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  List,
  ListItem,
  ListVariant,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Application } from 'generated/proto/application_pb';
import Metrics from 'components/applications/details/metrics/Metrics';
import Resources from 'components/applications/details/resources/Resources';
import Title from 'components/shared/Title';

interface IDrawerPanelProps {
  application: Application;
  close: () => void;
}

// DrawerPanel is the drawer panel for an application. It is used to display application details in the applications
// page. The details contains information for resources, metrics, logs and traces.
const DrawerPanel: React.FunctionComponent<IDrawerPanelProps> = ({ application, close }: IDrawerPanelProps) => {
  const [activeTabKey, setActiveTabKey] = useState<string>('resources');

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
            <Link
              to={`/applications/${application.getCluster()}/${application.getNamespace()}/${application.getName()}`}
            >
              Details
            </Link>
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
          mountOnEnter={true}
          isFilled={true}
          activeKey={activeTabKey}
          onSelect={(event, tabIndex): void => setActiveTabKey(tabIndex.toString())}
        >
          <Tab eventKey="resources" title={<TabTitleText>Resources</TabTitleText>}>
            <div>
              <Resources application={application} />
            </div>
          </Tab>
          <Tab eventKey="metrics" title={<TabTitleText>Metrics</TabTitleText>}>
            <div>
              <Metrics application={application} />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DrawerPanel;
