import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import { TopologyIcon, UsersIcon } from '@patternfly/react-icons';
import React from 'react';

import { IApplication } from '../../crds/application';

interface IApplicationsListItemProps {
  application: IApplication;
}

const ApplicationsListItem: React.FunctionComponent<IApplicationsListItemProps> = ({
  application,
}: IApplicationsListItemProps) => {
  return (
    <DataListItem id={application.id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>
                    {application.name}{' '}
                    {application.topology && application.topology.external === true
                      ? ''
                      : `(${application.namespace} / ${application.cluster})`}
                  </p>
                  <small>{application.description}</small>
                </FlexItem>
                <Flex>
                  <FlexItem>
                    <UsersIcon />
                    {application.teams
                      ? application.teams.length === 1
                        ? ` 1 Team`
                        : ` ${application.teams.length} Teams`
                      : ` 0 Teams`}
                  </FlexItem>
                  <FlexItem>
                    <TopologyIcon />
                    {application.topology &&
                    application.topology.dependencies &&
                    application.topology.dependencies.length
                      ? application.topology.dependencies.length === 1
                        ? ` 1 Dependency`
                        : ` ${application.topology.dependencies.length} Dependencies`
                      : ` 0 Dependencies`}
                  </FlexItem>
                  {application.topology && application.topology.external && application.topology.external === true ? (
                    <FlexItem>External Application</FlexItem>
                  ) : null}
                  {application.topology && application.topology.type ? (
                    <FlexItem>{application.topology.type}</FlexItem>
                  ) : null}
                </Flex>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

export default ApplicationsListItem;
