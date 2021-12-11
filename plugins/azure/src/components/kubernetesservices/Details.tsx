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
} from '@patternfly/react-core';
import React, { useState } from 'react';

import DetailsKubernetesService from './DetailsKubernetesService';
import DetailsMetricsAPIServer from './DetailsMetricsAPIServer';
import DetailsMetricsNode from './DetailsMetricsNode';
import DetailsMetricsPod from './DetailsMetricsPod';
import DetailsNodePoolsWrapper from './DetailsNodePoolsWrapper';
import { Title } from '@kobsio/plugin-core';

interface IDetailsProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  resourceGroup,
  managedCluster,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={managedCluster} subtitle={resourceGroup} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobsio-azure-tab-content">
        <Tabs
          activeKey={activeTab}
          onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
          className="pf-u-mt-md"
          isFilled={true}
          mountOnEnter={true}
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsKubernetesService name={name} resourceGroup={resourceGroup} managedCluster={managedCluster} />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="nodepools" title={<TabTitleText>Node Pools</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsNodePoolsWrapper name={name} resourceGroup={resourceGroup} managedCluster={managedCluster} />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="apiservermetrics" title={<TabTitleText>API Server Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsAPIServer name={name} resourceGroup={resourceGroup} managedCluster={managedCluster} />
            </div>
          </Tab>

          <Tab eventKey="nodemetrics" title={<TabTitleText>Node Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsNode name={name} resourceGroup={resourceGroup} managedCluster={managedCluster} />
            </div>
          </Tab>

          <Tab eventKey="podmetrics" title={<TabTitleText>Pod Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsPod name={name} resourceGroup={resourceGroup} managedCluster={managedCluster} />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
