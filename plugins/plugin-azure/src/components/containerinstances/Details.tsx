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
import React, { useRef, useState } from 'react';

import { IPluginInstance, useDimensions } from '@kobsio/shared';
import DetailsContainerGroup from './DetailsContainerGroup';
import DetailsContainerGroupActions from './DetailsContainerGroupActions';
import DetailsLogs from './DetailsLogs';
import DetailsMetrics from './DetailsMetrics';

interface IDetailsProps {
  instance: IPluginInstance;
  resourceGroup: string;
  containerGroup: string;
  containers: string[];
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  instance,
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
        <Title headingLevel="h2" size="xl">
          {containerGroup}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{resourceGroup}</span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <DetailsContainerGroupActions
            instance={instance}
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
            isFilled={false}
            usePageInsets={true}
            mountOnEnter={true}
          >
            <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true}>
                  <CardBody>
                    <DetailsContainerGroup
                      instance={instance}
                      resourceGroup={resourceGroup}
                      containerGroup={containerGroup}
                    />
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab eventKey="metrics" title={<TabTitleText>Metrics</TabTitleText>}>
              <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
                <DetailsMetrics instance={instance} resourceGroup={resourceGroup} containerGroup={containerGroup} />
              </div>
            </Tab>

            <Tab eventKey="logs" title={<TabTitleText>Logs</TabTitleText>}>
              <div style={{ height: `${tabsWrapperSize.height - 32}px`, maxWidth: '100%', padding: '24px 24px' }}>
                <Card isCompact={true} style={{ height: '100%' }}>
                  <CardBody>
                    <DetailsLogs
                      instance={instance}
                      resourceGroup={resourceGroup}
                      containerGroup={containerGroup}
                      containers={containers}
                      tail={10000}
                      timestamps={false}
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
