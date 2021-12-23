import { Avatar, Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IUserProfile, LinkWrapper, getGravatarImageUrl } from '@kobsio/plugin-core';

interface IUsersItemProps {
  cluster: string;
  namespace: string;
  name: string;
  profile: IUserProfile;
}

// UsersItem renders a single user in a Card component. The Card is wrapped by our LinkWrapper so that the user is
// redirected to the page of the user, when he clicks on the card.
const UsersItem: React.FunctionComponent<IUsersItemProps> = ({
  cluster,
  namespace,
  name,
  profile,
}: IUsersItemProps) => {
  return (
    <LinkWrapper link={`/users/${cluster}/${namespace}/${name}`}>
      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
        <CardHeader>
          <Avatar
            src={getGravatarImageUrl(profile.email, 27)}
            alt={profile.fullName}
            style={{ height: '27px', marginRight: '5px', width: '27px' }}
          />
          <CardTitle>{profile.fullName}</CardTitle>
        </CardHeader>
        <CardBody>{profile?.position ? <p>{profile.position}</p> : <p>&nbsp;</p>}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default UsersItem;
