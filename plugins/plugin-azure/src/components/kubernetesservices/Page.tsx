import React, { useState } from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import KubernetesServices from './KubernetesServices';
import { services } from '../../utils/services';

const service = 'kubernetesservices';

interface IKubernetesServicesPageProps {
  instance: IPluginInstance;
  resourceGroups: string[];
}

const KubernetesServicesPage: React.FunctionComponent<IKubernetesServicesPageProps> = ({
  instance,
  resourceGroups,
}: IKubernetesServicesPageProps) => {
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={`${instance.name} / ${instance.satellite}`}
            name={services[service].name}
            description={services[service].description}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={details}>
        <KubernetesServices instance={instance} resourceGroups={resourceGroups} setDetails={setDetails} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default KubernetesServicesPage;
