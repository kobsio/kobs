import { Drawer, DrawerContent, DrawerContentBody, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useState } from 'react';

import KubernetesServices from './KubernetesServices';
import { Title } from '@kobsio/plugin-core';
import { services } from '../../utils/services';

const service = 'kubernetesservices';

interface IKubernetesServicesPageProps {
  name: string;
  displayName: string;
  resourceGroups: string[];
}

const KubernetesServicesPage: React.FunctionComponent<IKubernetesServicesPageProps> = ({
  name,
  displayName,
  resourceGroups,
}: IKubernetesServicesPageProps) => {
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
              <KubernetesServices name={name} resourceGroups={resourceGroups} setDetails={setDetails} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default KubernetesServicesPage;
