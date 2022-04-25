import { PageSection, PageSectionVariants, Skeleton } from '@patternfly/react-core';
import React from 'react';

import { PageContentSection } from '@kobsio/shared';

const PluginPageLoading: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Skeleton width="25%" fontSize="md" screenreaderText="Loading title" />
        <br />
        <Skeleton width="75%" fontSize="sm" screenreaderText="Loading description" />
      </PageSection>
      <PageContentSection toolbarContent={undefined} panelContent={undefined}>
        <p></p>
      </PageContentSection>
    </React.Fragment>
  );
};

export default PluginPageLoading;
