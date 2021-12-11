import { Drawer, DrawerContent, DrawerContentBody, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useState } from 'react';

import { Title } from '@kobsio/plugin-core';
import VirtualMachineScaleSets from './VirtualMachineScaleSets';
import { services } from '../../utils/services';

const service = 'virtualmachinescalesets';

interface IVirtualMachineScaleSetsPageProps {
  name: string;
  displayName: string;
  resourceGroups: string[];
}

const VirtualMachineScaleSetsPage: React.FunctionComponent<IVirtualMachineScaleSetsPageProps> = ({
  name,
  displayName,
  resourceGroups,
}: IVirtualMachineScaleSetsPageProps) => {
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={services[service].name} subtitle={displayName} size="xl" />
        <p>{services[service].description}</p>
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <VirtualMachineScaleSets name={name} resourceGroups={resourceGroups} setDetails={setDetails} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default VirtualMachineScaleSetsPage;
