import { Gallery, GalleryItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from 'react-query';

import { IAuthProfile, IAuthProfileTeam } from '../../context/AuthContext';
import AccountTeamsItem from './AccountTeamsItem';

export interface IAccountTeamsProps {
  user: IAuthProfile;
}

const AccountTeams: React.FunctionComponent<IAccountTeamsProps> = ({ user }: IAccountTeamsProps) => {
  const { isError, isLoading, data } = useQuery<IAuthProfileTeam[], Error>(['users/teams', user], async () => {
    try {
      const response = await fetch(`/api/plugins/users/teams?cluster=${user.cluster}&namespace=${user.namespace}`, {
        body: JSON.stringify({
          teams: user.teams,
        }),
        method: 'post',
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
    } catch (err) {
      throw err;
    }
  });

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <PageSection variant={PageSectionVariants.default}>
      <Gallery hasGutter={true}>
        {data.map((team, index) => (
          <GalleryItem key={index}>
            <AccountTeamsItem
              cluster={team.cluster}
              namespace={team.namespace}
              name={team.name}
              description={team.description}
              logo={team.logo}
            />
          </GalleryItem>
        ))}
      </Gallery>
    </PageSection>
  );
};

export default AccountTeams;
