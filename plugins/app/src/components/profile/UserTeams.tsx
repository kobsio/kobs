import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Avatar,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';
import UserIcon from '@patternfly/react-icons/dist/esm/icons/user-icon';

import { ITeam } from '../../crds/team';
import { LinkWrapper } from '@kobsio/shared';

export interface IUserTeamsProps {
  setDetails?: (details: React.ReactNode) => void;
}

const UserTeams: React.FunctionComponent<IUserTeamsProps> = ({ setDetails }: IUserTeamsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITeam[], Error>(['app/teams/user'], async () => {
    const response = await fetch(`/api/teams`, {
      method: 'get',
    });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="An error occured while applications were fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UserIcon} />
        <Title headingLevel="h2" size="lg">
          No teams found
        </Title>
        <EmptyStateBody>We could not found any teams you are part of.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <DataList aria-label="teams list">
      {data.map((team) => (
        <LinkWrapper key={team.group} to={`/teams/${encodeURIComponent(team.group)}`}>
          <DataListItem id={team.group} aria-labelledby={team.group}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="main">
                    <Flex>
                      <Flex direction={{ default: 'row' }} alignSelf={{ default: 'alignSelfCenter' }}>
                        <FlexItem>
                          {team.logo ? (
                            <Avatar alt="team logo" src={team.logo} />
                          ) : (
                            <UserIcon style={{ fontSize: '36px' }} />
                          )}
                        </FlexItem>
                      </Flex>
                      <Flex direction={{ default: 'row' }} alignSelf={{ default: 'alignSelfCenter' }}>
                        <FlexItem>
                          <p>{team.group}</p>
                          <small>{team.description}</small>
                        </FlexItem>
                      </Flex>
                    </Flex>
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </LinkWrapper>
      ))}
    </DataList>
  );
};

export default UserTeams;
