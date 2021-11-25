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
import React, { useRef, useState } from 'react';

import { Title, useDimensions } from '@kobsio/plugin-core';
import DetailsContainerGroup from './DetailsContainerGroup';
import DetailsContainerGroupActions from './DetailsContainerGroupActions';
import DetailsLogs from './DetailsLogs';
import DetailsMetrics from './DetailsMetrics';

interface IDetailsProps {
  name: string;
  resourceGroup: string;
  containerGroup: string;
  containers: string[];
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  resourceGroup,
  containerGroup,
  containers,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');
  const refTabsWrapper = useRef<HTMLDivElement>(null);
  const tabsWrapperSize = useDimensions(refTabsWrapper);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={containerGroup} subtitle={resourceGroup} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DetailsContainerGroupActions
            name={name}
            resourceGroup={resourceGroup}
            containerGroup={containerGroup}
            isPanelAction={false}
          />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody className="kobsio-azure-tab-content">
        <div style={{ height: '100%' }} ref={refTabsWrapper}>
          <Tabs
            activeKey={activeTab}
            onSelect={(event, tabIndex): void => setActiveTab(tabIndex.toString())}
            className="pf-u-mt-md"
            isFilled={true}
            mountOnEnter={true}
          >
            <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <CardBody>
                    <DetailsContainerGroup name={name} resourceGroup={resourceGroup} containerGroup={containerGroup} />
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="metrics" title={<TabTitleText>Metrics</TabTitleText>}>
              <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
                <DetailsMetrics name={name} resourceGroup={resourceGroup} containerGroup={containerGroup} />
              </div>
            </Tab>

            <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
              <div
                style={{
                  height: `${tabsWrapperSize.height - 32}px`,
                  maxWidth: '100%',
                  overflowX: 'scroll',
                  padding: '24px 24px',
                }}
              >
                <Card isCompact={true} style={{ height: '100%' }}>
                  <CardBody>
                    <DetailsLogs
                      name={name}
                      resourceGroup={resourceGroup}
                      containerGroup={containerGroup}
                      containers={containers}
                    />
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </div>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
