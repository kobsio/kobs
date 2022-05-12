import React from 'react';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';

const Settings: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <PageHeaderSection
        title="Settings"
        description="The settings for you hub and all the satellites. You can also view the resources, which are available via each satellite."
      />

      <PageContentSection toolbarContent={undefined} panelContent={undefined}>
        <div>TODO: Show settings</div>
      </PageContentSection>
    </React.Fragment>
  );
};

export default Settings;
