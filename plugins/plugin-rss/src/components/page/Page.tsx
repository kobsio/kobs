import React from 'react';

import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { defaultDescription } from '../../utils/constants';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={undefined}>
        <div></div>
      </PageContentSection>
    </React.Fragment>
  );
};

export default Page;
