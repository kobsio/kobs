import React from 'react';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Stats from './Stats';
import { defaultDescription } from '../../utils/constants';

interface IStatsPageProps {
  instance: IPluginInstance;
}

const StatsPage: React.FunctionComponent<IStatsPageProps> = ({ instance }: IStatsPageProps) => {
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
        <Stats instance={instance} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default StatsPage;
