import { Alert, AlertVariant, PageSection } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import ProfileWrapper from './ProfileWrapper';

const Profile: React.FunctionComponent = () => {
  const authContext = useContext<IAuthContext>(AuthContext);

  if (authContext.user.email === '') {
    return (
      <PageSection>
        <Alert variant={AlertVariant.info} title="Profile not available">
          <p>The profile is only available, when kobs is running with authentication enabled.</p>
        </Alert>
      </PageSection>
    );
  }

  return (
    <React.Fragment>
      <PageHeaderSection title={authContext.user.email} description="" />

      <PageContentSection hasPadding={false} hasDivider={false} toolbarContent={undefined} panelContent={undefined}>
        <ProfileWrapper email={authContext.user.email} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default Profile;
