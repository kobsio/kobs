import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { useRef, useState } from 'react';
import { IRow } from '@patternfly/react-table';
import yaml from 'js-yaml';

import Editor from 'components/Editor';
import ResourceEvents from 'components/resources/ResourceEvents';
import Title from 'components/Title';

// IResourceDetailsProps is the interface for the ResourceDetails. The component requires a resource and an function to
// close the drawer panel.
interface IResourceDetailsProps {
  resource: IRow;
  close: () => void;
}

// ResourceDetails is a drawer panel to display details for a selected resource. It displayes the name of the resource,
// namespace and cluster in the title of the drawer panel. The body contains several tabs, which displays the yaml
// representation of the resource and events, which are related to this resource.
const ResourceDetails: React.FunctionComponent<IResourceDetailsProps> = ({
  resource,
  close,
}: IResourceDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('yaml');
  const refYamlContent = useRef<HTMLElement>(null);
  const refEventsContent = useRef<HTMLElement>(null);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name.title}
          subtitle={
            resource.namespace ? `${resource.namespace.title} (${resource.cluster.title})` : resource.cluster.title
          }
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Tabs
          className="pf-u-mt-md"
          isFilled={true}
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
        >
          <Tab
            eventKey="yaml"
            title={<TabTitleText>Yaml</TabTitleText>}
            tabContentId="refYaml"
            tabContentRef={refYamlContent}
          />
          <Tab
            eventKey="events"
            title={<TabTitleText>Events</TabTitleText>}
            tabContentId="refEvents"
            tabContentRef={refEventsContent}
          />
        </Tabs>

        <TabContent
          style={{ maxWidth: '100%', overflowX: 'scroll', padding: '16px 0px' }}
          eventKey="yaml"
          id="refYaml"
          activeKey={activeTab}
          ref={refYamlContent}
          aria-label="Resources"
        >
          <Editor value={yaml.dump(resource.props)} mode="yaml" readOnly={true} />
        </TabContent>

        <TabContent
          style={{ maxWidth: '100%', overflowX: 'scroll', padding: '16px 0px' }}
          eventKey="yaml"
          id="refEvents"
          activeKey={activeTab}
          ref={refEventsContent}
          aria-label="Resources"
          hidden={true}
        >
          <ResourceEvents
            cluster={resource.cluster.title}
            namespace={resource.namespace ? resource.namespace.title : ''}
            name={resource.name.title}
          />
        </TabContent>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default ResourceDetails;
