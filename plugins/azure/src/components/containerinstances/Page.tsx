import { Drawer, DrawerContent, DrawerContentBody, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useState } from 'react';

import ContainerGroups from './ContainerGroups';
import { Title } from '@kobsio/plugin-core';
import { services } from '../../utils/services';

const service = 'containerinstances';

interface IContainerInstancesPageProps {
  name: string;
  displayName: string;
  resourceGroups: string[];
}

const ContainerInstancesPage: React.FunctionComponent<IContainerInstancesPageProps> = ({
  name,
  displayName,
  resourceGroups,
}: IContainerInstancesPageProps) => {
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
              <ContainerGroups name={name} resourceGroups={resourceGroups} setDetails={setDetails} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default ContainerInstancesPage;
