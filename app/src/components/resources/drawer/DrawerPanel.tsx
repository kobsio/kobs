import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';
import yaml from 'js-yaml';

import Events from 'components/resources/drawer/Events';
import Title from 'components/shared/Title';
import Yaml from 'components/resources/drawer/Yaml';

interface IResourceProps {
  resource: IRow;
  close: () => void;
}

// DrawerPanel is the drawer panel component for the resources page. It is used to display a selected resource. The user
// can choose between different tabs: The "Yaml" tab displayes the yaml manifest for the selected resource and the
// "Events" tab displayes all events for the selected resource. The component also needs a close function, which is used
// to hide the drawer.
const DrawerPanel: React.FunctionComponent<IResourceProps> = ({ resource, close }: IResourceProps) => {
  const [activeTabKey, setActiveTabKey] = useState<string>('yaml');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name.title}
          subtitle={`${resource.namespace.title} (${resource.cluster.title})`}
          size="lg"
        />
        <DrawerActions className="kobs-drawer-actions">
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobs-drawer-panel-body">
        <Tabs
          mountOnEnter={true}
          isFilled={true}
          activeKey={activeTabKey}
          onSelect={(event, tabIndex): void => setActiveTabKey(tabIndex.toString())}
        >
          <Tab eventKey="yaml" title={<TabTitleText>Yaml</TabTitleText>}>
            <Yaml yaml={yaml.dump(resource.props)} />
          </Tab>
          <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
            <Events cluster={resource.cluster.title} namespace={resource.namespace.title} name={resource.name.title} />
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DrawerPanel;
