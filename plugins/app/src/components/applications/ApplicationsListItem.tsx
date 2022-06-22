import {
  Button,
  ButtonVariant,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import React from 'react';

import { IApplication } from '../../crds/application';

interface IApplicationsListItemProps {
  application: IApplication;
}

const ApplicationsListItem: React.FunctionComponent<IApplicationsListItemProps> = ({
  application,
}: IApplicationsListItemProps) => {
  return (
    <DataListItem id={application.id} aria-labelledby={application.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>
                    {application.name}
                    <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                      {application.topology && application.topology.external === true
                        ? ''
                        : `(${application.namespace} / ${application.cluster})`}
                    </span>
                  </p>
                  <small>{application.description}</small>
                </FlexItem>
                <Flex>
                  {application.tags && application.tags.length > 0 && (
                    <FlexItem>
                      {application.tags.map((tag) => (
                        <Label key={tag} className="pf-u-mr-sm" color="blue">
                          {tag}
                        </Label>
                      ))}
                    </FlexItem>
                  )}
                  {application.teams && application.teams.length > 0 && (
                    <FlexItem>
                      <Label color="grey" icon={<UsersIcon />}>
                        {application.teams.length === 1 ? '1 Team' : `${application.teams.length} Teams`}
                      </Label>
                    </FlexItem>
                  )}
                  {application.topology &&
                    application.topology.dependencies &&
                    application.topology.dependencies.length > 0 && (
                      <FlexItem>
                        <Label color="grey" icon={<TopologyIcon />}>
                          {application.topology.dependencies.length === 1
                            ? '1 Dependency'
                            : `${application.topology.dependencies.length} Dependencies`}
                        </Label>
                      </FlexItem>
                    )}
                  {application.topology && application.topology.external && application.topology.external === true && (
                    <FlexItem>
                      <Label color="grey" icon={<TopologyIcon />}>
                        External Application
                      </Label>
                    </FlexItem>
                  )}
                </Flex>
              </Flex>
            </DataListCell>,
          ]}
        />
        <DataListAction aria-labelledby={application.id} id={application.id} aria-label="Actions">
          <Button
            variant={ButtonVariant.link}
            component={(props): React.ReactElement => <Link {...props} to={`/applications${application.id}`} />}
          >
            View Details
          </Button>
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};

export default ApplicationsListItem;
