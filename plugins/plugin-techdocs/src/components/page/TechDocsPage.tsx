import { Card } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import TechDocsList from '../panel/TechDocsList';
import { defaultDescription } from '../../utils/constants';

interface ITechDocsPageProps {
  instance: IPluginInstance;
}

const TechDocsPage: React.FunctionComponent<ITechDocsPageProps> = ({ instance }: ITechDocsPageProps) => {
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

      <PageContentSection hasPadding={true} toolbarContent={undefined} panelContent={undefined}>
        <Card>
          <TechDocsList instance={instance} />
        </Card>
      </PageContentSection>
    </React.Fragment>
  );
};

export default TechDocsPage;
