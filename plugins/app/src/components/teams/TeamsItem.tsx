import {
  Bullseye,
  Card,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import UsersIcon from '@patternfly/react-icons/dist/esm/icons/users-icon';
import { useNavigate } from 'react-router-dom';

import { ITeam } from '../../crds/team';

interface ITeamsItemProps {
  team: ITeam;
}

const TeamsItem: React.FunctionComponent<ITeamsItemProps> = ({ team }: ITeamsItemProps) => {
  const navigate = useNavigate();

  const Icon = (): React.ReactElement => {
    return <img src={team.logo} alt={`${team.group} icon`} style={{ maxWidth: '64px' }} />;
  };

  return (
    <Card
      isHoverable={true}
      isCompact={true}
      onClick={(): void => navigate(`/teams/${encodeURIComponent(team.group)}`)}
    >
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xs}>
          {team.logo ? (
            <EmptyStateIcon variant="container" component={Icon} />
          ) : (
            <EmptyStateIcon variant="icon" icon={UsersIcon} />
          )}
          <Title headingLevel="h2" size="md">
            {team.group}
          </Title>
          <EmptyStateBody>{team.description}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </Card>
  );
};

export default TeamsItem;
