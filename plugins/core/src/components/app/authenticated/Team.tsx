import { Avatar, Card, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import Applications from './Applications';
import { ITeam } from '../../../crds/team';
import { IUserTeamReference } from '../../../crds/user';
import { LinkWrapper } from '../../misc/LinkWrapper';
import teamsIcon from '../../../assets/teamsIcon.png';

export interface ITeamProps {
  team: IUserTeamReference;
}

const Team: React.FunctionComponent<ITeamProps> = ({ team }: ITeamProps) => {
  const { data } = useQuery<ITeam, Error>(['core/team', team], async () => {
    try {
      const response = await fetch(
        `/api/plugins/teams/team?cluster=${team.cluster}&namespace=${team.namespace}&name=${team.name}`,
        { method: 'get' },
      );
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
    } catch (err) {
      throw err;
    }
  });

  return (
    <React.Fragment>
      <LinkWrapper link={`/teams/${team.cluster}/${team.namespace}/${team.name}`}>
        <Card isHoverable={true}>
          <CardHeader>
            <Avatar
              src={data && data.logo ? data.logo : teamsIcon}
              alt={team.name}
              style={{ height: '27px', marginRight: '5px', width: '27px' }}
            />
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
        </Card>
      </LinkWrapper>
      <p>&nbsp;</p>
      <Applications team={team} />
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
    </React.Fragment>
  );
};

export default Team;
