import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import React from 'react';

import { IResourceRow } from '@kobsio/plugin-core';

// getTeams parses the kobs.io/teams annotation of a Kubernetes resources and returns all provided teams.
const getTeams = (resource: IResourceRow): { cluster: string; namespace: string; name: string }[] | undefined => {
  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations['kobs.io/teams']
    ) {
      return JSON.parse(resource.props.metadata.annotations['kobs.io/teams'], resource.props);
    }
  } catch (err) {
    return undefined;
  }
};

// getApplications parses the kobs.io/teams annotation of a Kubernetes resources and returns all provided teams.
const getApplications = (
  resource: IResourceRow,
): { cluster: string; namespace: string; name: string }[] | undefined => {
  try {
    if (
      resource.props &&
      resource.props.metadata &&
      resource.props.metadata.annotations &&
      resource.props.metadata.annotations['kobs.io/applications']
    ) {
      return JSON.parse(resource.props.metadata.annotations['kobs.io/applications'], resource.props);
    }
  } catch (err) {
    return undefined;
  }
};

interface ILinksProps {
  resource: IResourceRow;
}

const Links: React.FunctionComponent<ILinksProps> = ({ resource }: ILinksProps) => {
  const teams = getTeams(resource);
  const applications = getApplications(resource);

  if ((applications && applications.length > 0) || (teams && teams.length > 0)) {
    return (
      <div style={{ maxWidth: '100%', padding: '0px 24px' }}>
        <DescriptionList isHorizontal={true} isAutoFit={true}>
          {applications && applications.length > 0 ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Applications</DescriptionListTerm>
              <DescriptionListDescription>
                {applications.map((application, index) => (
                  <Link
                    key={index}
                    to={`/applications/${application.cluster || resource.cluster}/${
                      application.namespace || resource.namespace
                    }/${application.name}`}
                  >
                    <Button variant={ButtonVariant.link} isInline={true} icon={<TopologyIcon />}>
                      {application.name}
                    </Button>
                    <br />
                  </Link>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
          {teams && teams.length > 0 ? (
            <DescriptionListGroup>
              <DescriptionListTerm>Teams</DescriptionListTerm>
              <DescriptionListDescription>
                {teams.map((team, index) => (
                  <Link
                    key={index}
                    to={`/teams/${team.cluster || resource.cluster}/${team.namespace || resource.namespace}/${
                      team.name
                    }`}
                  >
                    <Button variant={ButtonVariant.link} isInline={true} icon={<UsersIcon />}>
                      {team.name}
                    </Button>
                    <br />
                  </Link>
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : null}
        </DescriptionList>
      </div>
    );
  }

  return null;
};

export default Links;
