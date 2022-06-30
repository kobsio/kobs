import { Alert, AlertVariant, PageSection } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import ProfileWrapper from './ProfileWrapper';

const Profile: React.FunctionComponent = () => {
  const [details, setDetails] = useState<React.ReactNode>(undefined);
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

      <PageContentSection hasPadding={false} hasDivider={false} toolbarContent={undefined} panelContent={details}>
        <ProfileWrapper email={authContext.user.email} setDetails={setDetails} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default Profile;
