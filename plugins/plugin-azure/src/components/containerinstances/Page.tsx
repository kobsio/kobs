import React, { useState } from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import ContainerGroups from './ContainerGroups';
import { services } from '../../utils/services';

const service = 'containerinstances';

interface IContainerInstancesPageProps {
  instance: IPluginInstance;
  resourceGroups: string[];
}

const ContainerInstancesPage: React.FunctionComponent<IContainerInstancesPageProps> = ({
  instance,
  resourceGroups,
}: IContainerInstancesPageProps) => {
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
        <ContainerGroups instance={instance} resourceGroups={resourceGroups} setDetails={setDetails} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default ContainerInstancesPage;
