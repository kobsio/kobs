import React, { useState } from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import VirtualMachineScaleSets from './VirtualMachineScaleSets';
import { services } from '../../utils/services';

const service = 'virtualmachinescalesets';

interface IVirtualMachineScaleSetsPageProps {
  instance: IPluginInstance;
  resourceGroups: string[];
}

const VirtualMachineScaleSetsPage: React.FunctionComponent<IVirtualMachineScaleSetsPageProps> = ({
  instance,
  resourceGroups,
}: IVirtualMachineScaleSetsPageProps) => {
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

      <PageContentSection hasPadding={true} toolbarContent={undefined} panelContent={details}>
        <VirtualMachineScaleSets instance={instance} resourceGroups={resourceGroups} setDetails={setDetails} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default VirtualMachineScaleSetsPage;
