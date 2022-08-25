import { Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import OverviewPageActions from './OverviewPageActions';
import OverviewPanel from '../panel/OverviewPanel';
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
            actions={<OverviewPageActions instance={instance} />}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={undefined}>
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>
            <OverviewPanel
              title="Overview for the last 7 days"
              instance={instance}
              times={{
                time: 'last7Days',
                timeEnd: Math.floor(Date.now() / 1000),
                timeStart: Math.floor(Date.now() / 1000) - 604800,
              }}
            />
          </FlexItem>
        </Flex>
      </PageContentSection>
    </React.Fragment>
  );
};

export default OverviewPage;
