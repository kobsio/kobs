import {
  Card,
  CardBody,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import DetailsKubernetesService from './DetailsKubernetesService';
import DetailsMetricsAPIServer from './DetailsMetricsAPIServer';
import DetailsMetricsNode from './DetailsMetricsNode';
import DetailsMetricsPod from './DetailsMetricsPod';
import DetailsNodePoolsWrapper from './DetailsNodePoolsWrapper';
import { IPluginInstance } from '@kobsio/shared';

interface IDetailsProps {
  instance: IPluginInstance;
  resourceGroup: string;
  managedCluster: string;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  instance,
  resourceGroup,
  managedCluster,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {managedCluster}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{resourceGroup}</span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobsio-azure-tab-content">
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={false}
          usePageInsets={true}
          mountOnEnter={true}
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsKubernetesService
                    instance={instance}
                    resourceGroup={resourceGroup}
                    managedCluster={managedCluster}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="nodepools" title={<TabTitleText>Node Pools</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsNodePoolsWrapper
                    instance={instance}
                    resourceGroup={resourceGroup}
                    managedCluster={managedCluster}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="apiservermetrics" title={<TabTitleText>API Server Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsAPIServer
                instance={instance}
                resourceGroup={resourceGroup}
                managedCluster={managedCluster}
              />
            </div>
          </Tab>

          <Tab eventKey="nodemetrics" title={<TabTitleText>Node Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsNode instance={instance} resourceGroup={resourceGroup} managedCluster={managedCluster} />
            </div>
          </Tab>

          <Tab eventKey="podmetrics" title={<TabTitleText>Pod Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsPod instance={instance} resourceGroup={resourceGroup} managedCluster={managedCluster} />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
