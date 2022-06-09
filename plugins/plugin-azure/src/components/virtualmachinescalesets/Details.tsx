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

import DetailsMetricsVirtualMachine from './DetailsMetricsVirtualMachine';
import DetailsMetricsVirtualMachineScaleSet from './DetailsMetricsVirtualMachineScaleSet';
import DetailsVirtualMachineScaleSets from './DetailsVirtualMachineScaleSets';
import DetailsVirtualMachines from './DetailsVirtualMachines';
import { IPluginInstance } from '@kobsio/shared';

interface IDetailsProps {
  instance: IPluginInstance;
  resourceGroup: string;
  virtualMachineScaleSet: string;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  instance,
  resourceGroup,
  virtualMachineScaleSet,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {virtualMachineScaleSet}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">{resourceGroup}</span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
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
                  <DetailsVirtualMachineScaleSets
                    instance={instance}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="metrics" title={<TabTitleText>Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsVirtualMachineScaleSet
                instance={instance}
                resourceGroup={resourceGroup}
                virtualMachineScaleSet={virtualMachineScaleSet}
              />
            </div>
          </Tab>

          <Tab eventKey="virtualmachines" title={<TabTitleText>Virtual Machines</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsVirtualMachines
                    instance={instance}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="vmmetrics" title={<TabTitleText>Virtual Machines Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <DetailsMetricsVirtualMachine
                instance={instance}
                resourceGroup={resourceGroup}
                virtualMachineScaleSet={virtualMachineScaleSet}
              />
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
