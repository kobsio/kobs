import { ExternalLinkAltIcon, TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';

import { IApplication } from '../../crds/application';

interface IApplicationDetailsLabelsProps {
  application: IApplication;
}

const ApplicationDetailsLabels: React.FunctionComponent<IApplicationDetailsLabelsProps> = ({
  application,
}: IApplicationDetailsLabelsProps) => {
  return (
    <Flex>
      <FlexItem>
        {application.tags &&
          application.tags.length > 0 &&
          application.tags.map((tag) => (
            <Label
              key={tag}
              className="pf-u-mr-sm"
              color="blue"
              render={({ className, content, componentRef }): React.ReactNode => (
                <Link to={`/applications?tag=${encodeURIComponent(tag)}`} className={className} ref={componentRef}>
                  {content}
                </Link>
              )}
            >
              {tag}
            </Label>
          ))}

        {application.teams &&
          application.teams.length > 0 &&
          application.teams.map((team, index) => (
            <Label
              key={team}
              className={index === 0 ? 'pf-u-ml-sm pf-u-mr-sm' : 'pf-u-mr-sm'}
              color="grey"
              icon={<UsersIcon />}
              render={({ className, content, componentRef }): React.ReactNode => (
                <Link to={`/teams/${encodeURIComponent(team)}`} className={className} ref={componentRef}>
                  {content}
                </Link>
              )}
            >
              {team}
            </Label>
          ))}

        {application.topology &&
          application.topology.dependencies &&
          application.topology.dependencies.length > 0 &&
          application.topology.dependencies.map((dependency, index) => (
            <Label
              key={index}
              className={index === 0 ? 'pf-u-ml-sm pf-u-mr-sm' : 'pf-u-mr-sm'}
              color="grey"
              icon={<TopologyIcon />}
              render={({ className, content, componentRef }): React.ReactNode => (
                <Link
                  to={`/applications/${encodeURIComponent(
                    `/satellite/${dependency.satellite}/cluster/${dependency.cluster}/namespace/${dependency.namespace}/name/${dependency.name}`,
                  )}`}
                  className={className}
                  ref={componentRef}
                >
                  {content}
                </Link>
              )}
            >
              {dependency.name}
            </Label>
          ))}

        {application.links &&
          application.links.length > 0 &&
          application.links.map((link, index) => (
            <Label
              key={index}
              className={index === 0 ? 'pf-u-ml-sm pf-u-mr-sm' : 'pf-u-mr-sm'}
              color="grey"
              icon={<ExternalLinkAltIcon />}
              href={link.link}
            >
              {link.title}
            </Label>
          ))}
      </FlexItem>
    </Flex>
  );
};

export default ApplicationDetailsLabels;
