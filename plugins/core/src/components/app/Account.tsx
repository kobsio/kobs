import { Avatar, Card, CardBody, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import AccountTeams from './AccountTeams';
import { getGravatarImageUrl } from '../../utils/gravatar';

const Account: React.FunctionComponent = () => {
  const authContext = useContext<IAuthContext>(AuthContext);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.default}>
        <Card isCompact={true}>
          <CardBody>
            <div className="pf-u-text-align-center">
              <Avatar
                src={getGravatarImageUrl(authContext.user.profile.email, 64)}
                alt={authContext.user.profile.fullName}
                style={{ height: '64px', width: '64px' }}
              />
              <div className="pf-c-title pf-m-xl">{authContext.user.profile.fullName}</div>
              <div className="pf-u-font-size-md pf-u-color-400">{authContext.user.profile.position}</div>
            </div>
          </CardBody>
        </Card>
      </PageSection>

      {authContext.user.profile.teams && <AccountTeams user={authContext.user.profile} />}
    </React.Fragment>
  );
};

export default Account;
