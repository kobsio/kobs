import { Grid, GridItem } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Collections from '../panel/Collections';
import DBStats from '../panel/DBStats';
import { defaultDescription } from '../../utils/constants';

interface IOverviewPageProps {
  instance: IPluginInstance;
}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = ({ instance }: IOverviewPageProps) => {
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
      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={<div />} panelContent={undefined}>
        <Grid hasGutter={true}>
          <GridItem sm={12} md={12} lg={7} xl={9} xl2={9}>
            <Collections instance={instance} title="Collections" />
          </GridItem>
          <GridItem sm={12} md={12} lg={5} xl={3} xl2={3}>
            <DBStats instance={instance} title="Database Statistics" />
          </GridItem>
        </Grid>
      </PageContentSection>
    </React.Fragment>
  );
};

export default OverviewPage;
