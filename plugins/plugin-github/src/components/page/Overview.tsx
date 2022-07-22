import { Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { AuthContextProvider } from '../../context/AuthContext';
import OrgMembers from '../github/org/OrgMembers';
import OrgPullRequests from '../github/org/OrgPullRequests';
import OrgRepos from '../github/org/OrgRepos';
import OrgTeams from '../github/org/OrgTeams';
import { defaultDescription } from '../../utils/constants';

interface IOverviewProps {
  instance: IPluginInstance;
}

const Overview: React.FunctionComponent<IOverviewProps> = ({ instance }: IOverviewProps) => {
  const [details, setDetails] = useState<React.ReactNode>(undefined);

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

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={details}>
        <AuthContextProvider title="" isNotification={false} instance={instance}>
          <Grid hasGutter={true}>
            <GridItem span={9}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <OrgRepos title="Repositories" instance={instance} setDetails={setDetails} />
                </FlexItem>
              </Flex>
            </GridItem>
            <GridItem span={3}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <OrgMembers title="Members" instance={instance} />
                </FlexItem>
                <FlexItem>
                  <OrgPullRequests title="Recent Pull Requests" instance={instance} />
                </FlexItem>
                <FlexItem>
                  <OrgTeams title="Teams" instance={instance} setDetails={setDetails} />
                </FlexItem>
              </Flex>
            </GridItem>
          </Grid>
        </AuthContextProvider>
      </PageContentSection>
    </React.Fragment>
  );
};

export default Overview;
