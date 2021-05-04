import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import React from 'react';

import { Plugin } from 'proto/plugins_grpc_web_pb';

interface ITeamTabsProps {
  activeTab: string;
  setTab(tab: string): void;
  plugins: Plugin.AsObject[];
  refApplicationsContent: React.RefObject<HTMLElement>;
  refPluginsContent: React.RefObject<HTMLElement>[] | undefined;
}

// TeamTabs is the component to render all tabs for a team. A team always contains a tab for applications and a dynamic
// list of plugins.
const TeamTabs: React.FunctionComponent<ITeamTabsProps> = ({
  activeTab,
  setTab,
  plugins,
  refApplicationsContent,
  refPluginsContent,
}: ITeamTabsProps) => {
  return (
    <Tabs
      className="pf-u-mt-md"
      isFilled={true}
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setTab(tabIndex.toString())}
    >
      <Tab
        eventKey="applications"
        title={<TabTitleText>Applications</TabTitleText>}
        tabContentId="refApplications"
        tabContentRef={refApplicationsContent}
      />

      {plugins.map((plugin, index) => (
        <Tab
          key={index}
          eventKey={`refPlugin-${index}`}
          title={<TabTitleText>{plugin.displayname ? plugin.displayname : plugin.name}</TabTitleText>}
          tabContentId={`refPlugin-${index}`}
          tabContentRef={refPluginsContent ? refPluginsContent[index] : undefined}
        />
      ))}
    </Tabs>
  );
};

export default TeamTabs;
