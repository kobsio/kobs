import {
  Badge,
  Button,
  ButtonVariant,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  List,
  ListItem,
  ListVariant,
} from '@patternfly/react-core';
import { TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import React from 'react';

import { ExternalLink, IApplication, Title } from '@kobsio/plugin-core';
import { DashboardsWrapper } from '@kobsio/plugin-dashboards';
import DetailsLink from './DetailsLink';

interface IDetailsProps {
  application: IApplication;
  close: () => void;
}

// The Details component implements the component which is displayed in the drawer panel. It displays the cluster,
// namespace and name of the application in the title. Below the title we display all the teams and links. Most of the
// space is used to display the referenced dashboards of the application.
const Details: React.FunctionComponent<IDetailsProps> = ({ application, close }: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title title={application.name} subtitle={`${application.namespace} (${application.cluster})`} size="lg" />
        <DrawerActions style={{ padding: 0 }}>
          <DetailsLink application={application} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <div>
          {application.tags && (
            <p>
              {application.tags.map((tag) => (
                <Badge key={tag} className="pf-u-mr-sm">
                  {tag.toLowerCase()}
                </Badge>
              ))}
            </p>
          )}
          {application.description && <p>{application.description}</p>}
          {(application.teams && application.teams.length > 0) ||
          (application.dependencies && application.dependencies.length > 0) ||
          (application.links && application.links.length > 0) ? (
            <List variant={ListVariant.inline}>
              {application.teams && application.teams.length > 0
                ? application.teams.map((team, index) => (
                    <ListItem key={index}>
                      <Link
                        key={index}
                        to={`/teams/${team.cluster ? team.cluster : application.cluster}/${
                          team.namespace ? team.namespace : application.namespace
                        }/${team.name}`}
                      >
                        <Button variant={ButtonVariant.link} isInline={true} icon={<UsersIcon />}>
                          {team.name}
                        </Button>
                      </Link>
                    </ListItem>
                  ))
                : null}

              {application.dependencies && application.dependencies.length > 0
                ? application.dependencies.map((dependency, index) => (
                    <ListItem key={index}>
                      <Link
                        key={index}
                        to={`/applications/${dependency.cluster ? dependency.cluster : application.cluster}/${
                          dependency.namespace ? dependency.namespace : application.namespace
                        }/${dependency.name}`}
                      >
                        <Button variant={ButtonVariant.link} isInline={true} icon={<TopologyIcon />}>
                          {dependency.name}
                        </Button>
                      </Link>
                    </ListItem>
                  ))
                : null}

              {application.links && application.links.length
                ? application.links.map((link, index) => (
                    <ListItem key={index}>
                      <ExternalLink title={link.title} link={link.link} />
                    </ListItem>
                  ))
                : null}
            </List>
          ) : null}
        </div>

        <p>&nbsp;</p>

        {application.dashboards ? (
          <DashboardsWrapper defaults={application} references={application.dashboards} />
        ) : null}

        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
