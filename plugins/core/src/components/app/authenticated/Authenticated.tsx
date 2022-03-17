import React from 'react';

import { IUserTeamReference } from '../../../crds/user';
import Team from './Team';

export interface IAuthenticatedProps {
  teams: IUserTeamReference[];
}

const Authenticated: React.FunctionComponent<IAuthenticatedProps> = ({ teams }: IAuthenticatedProps) => {
  return (
    <React.Fragment>
      {teams.map((team) => (
        <Team key={`${team.cluster}-${team.namespace}-${team.name}`} team={team} />
      ))}
    </React.Fragment>
  );
};

export default Authenticated;
