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

import DetailsMetricsVirtualMachine from './DetailsMetricsVirtualMachine';
import DetailsMetricsVirtualMachineScaleSet from './DetailsMetricsVirtualMachineScaleSet';
import DetailsVirtualMachineScaleSets from './DetailsVirtualMachineScaleSets';
import DetailsVirtualMachines from './DetailsVirtualMachines';
import { Title } from '@kobsio/plugin-core';

interface IDetailsProps {
  name: string;
  resourceGroup: string;
  virtualMachineScaleSet: string;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({
  name,
  resourceGroup,
  virtualMachineScaleSet,
  close,
}: IDetailsProps) => {
  const [activeTab, setActiveTab] = useState<string>('details');

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={virtualMachineScaleSet} subtitle={resourceGroup} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
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
                  <DetailsVirtualMachineScaleSets
                    name={name}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="metrics" title={<TabTitleText>Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsMetricsVirtualMachineScaleSet
                    name={name}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="virtualmachines" title={<TabTitleText>Virtual Machines</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsVirtualMachines
                    name={name}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="vmmetrics" title={<TabTitleText>Virtual Machines Metrics</TabTitleText>}>
            <div style={{ maxWidth: '100%', padding: '24px 24px' }}>
              <Card isCompact={true}>
                <CardBody>
                  <DetailsMetricsVirtualMachine
                    name={name}
                    resourceGroup={resourceGroup}
                    virtualMachineScaleSet={virtualMachineScaleSet}
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
