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

import Events from './Events';
import Yaml from './Yaml';

interface IResourceProps {
  resource: IRow;
  columns: string[];
  close: () => void;
}

const Resource: React.FunctionComponent<IResourceProps> = ({ resource, columns, close }: IResourceProps) => {
  const [activeTabKey, setActiveTabKey] = useState<string>('yaml');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <span>
          <span className="pf-c-title pf-m-lg">{resource.name.title}</span>
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-200">
            {resource.namespace.title} ({resource.cluster.title})
          </span>
        </span>
        <DrawerActions className="kobs-drawer-actions">
          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobs-drawer-panel-body">
        <Tabs
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

export default Resource;
