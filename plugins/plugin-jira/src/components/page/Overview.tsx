import { Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { AuthContextProvider } from '../../context/AuthContext';
import Issues from '../jira/Issues';
import OverviewActions from './OverviewActions';
import Projects from '../jira/Projects';
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
            actions={<OverviewActions instance={instance} />}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={details}>
        <AuthContextProvider title="" isNotification={false} instance={instance}>
          <Grid hasGutter={true}>
            <GridItem span={8}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <Issues
                    title="Your Issues"
                    instance={instance}
                    jql="sprint in openSprints() and assignee = currentUser()"
                    setDetails={setDetails}
                  />
                </FlexItem>

                <FlexItem>
                  <Issues
                    title="Issues in Open Sprints"
                    instance={instance}
                    jql="sprint in openSprints() order by updatedDate"
                    setDetails={setDetails}
                  />
                </FlexItem>
              </Flex>
            </GridItem>
            <GridItem span={4}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <Projects title="Projects" instance={instance} />
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
