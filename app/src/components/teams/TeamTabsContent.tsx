import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  TabContent,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { Application } from 'proto/application_pb';
import { Team as ITeam } from 'proto/team_pb';
import Plugin from 'components/plugins/Plugin';
import TeamApplications from 'components/teams/TeamApplications';

// IMountedTabs is the interface, which is used in an object, which represents all mounted tabs. With this we can
// implement the "mountOnEnter" function from Patternfly for our tabs setup, because this function doesn't work when,
// the TabsContent component is used outside of the Tabs component.
export interface IMountedTabs {
  [key: string]: boolean;
}

interface ITeamTabsContent {
  applications: Application.AsObject[];
  team: ITeam.AsObject;
  activeTab: string;
  mountedTabs: IMountedTabs;
  refApplicationsContent: React.RefObject<HTMLElement>;
  refPluginsContent: React.RefObject<HTMLElement>[] | undefined;
}

// TeamTabsContent renders the content of an tab.
const TeamTabsContent: React.FunctionComponent<ITeamTabsContent> = ({
  applications,
  team,
  activeTab,
  mountedTabs,
  refApplicationsContent,
  refPluginsContent,
}: ITeamTabsContent) => {
  const [panelContent, setPanelContent] = useState<React.ReactNode | undefined>(undefined);

  return (
    <Drawer isExpanded={panelContent !== undefined}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
            <TabContent
              style={{ minHeight: '100%' }}
              eventKey="resources"
              id="refResources"
              activeKey={activeTab}
              ref={refApplicationsContent}
              aria-label="Resources"
            >
              <TeamApplications
                applications={applications}
                selectApplication={(details: React.ReactNode): void => setPanelContent(details)}
              />
            </TabContent>

            {team.pluginsList.map((plugin, index) => (
              <TabContent
                key={index}
                eventKey={`refPlugin-${index}`}
                id={`refPlugin-${index}`}
                activeKey={activeTab}
                ref={refPluginsContent && refPluginsContent[index] ? refPluginsContent[index] : undefined}
                hidden={true}
                aria-label={plugin.name}
              >
                <div>
                  {mountedTabs[`refPlugin-${index}`] ? (
                    <Plugin
                      plugin={plugin}
                      showDetails={(details: React.ReactNode): void => setPanelContent(details)}
                    />
                  ) : null}
                </div>
              </TabContent>
            ))}
          </PageSection>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default TeamTabsContent;
