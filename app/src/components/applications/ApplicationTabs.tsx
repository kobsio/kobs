import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import React from 'react';

import { Plugin } from 'proto/plugins_grpc_web_pb';

interface IApplicationTabsProps {
  activeTab: string;
  setTab(tab: string): void;
  plugins: Plugin.AsObject[];
  refResourcesContent: React.RefObject<HTMLElement>;
  refPluginsContent: React.RefObject<HTMLElement>[] | undefined;
}

// ApplicationTabs is the component to render all tabs for an application. An application always contains a tab for
// resources and a dynamic list of plugins.
const ApplicationTabs: React.FunctionComponent<IApplicationTabsProps> = ({
  activeTab,
  setTab,
  plugins,
  refResourcesContent,
  refPluginsContent,
}: IApplicationTabsProps) => {
  return (
    <Tabs
      className="pf-u-mt-md"
      isFilled={true}
      activeKey={activeTab}
      onSelect={(event, tabIndex): void => setTab(tabIndex.toString())}
    >
      <Tab
        eventKey="resources"
        title={<TabTitleText>Resources</TabTitleText>}
        tabContentId="refResources"
        tabContentRef={refResourcesContent}
      />

      {plugins.map((plugin, index) => (
        <Tab
          key={index}
          eventKey={`refPlugin-${index}`}
          title={<TabTitleText>{plugin.name}</TabTitleText>}
          tabContentId={`refPlugin-${index}`}
          tabContentRef={refPluginsContent ? refPluginsContent[index] : undefined}
        />
      ))}
    </Tabs>
  );
};

export default ApplicationTabs;
