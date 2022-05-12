import { Alert, AlertVariant, PageSection } from '@patternfly/react-core';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { PageContentSection, PageHeaderSection } from '@kobsio/shared';

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

      <PageContentSection toolbarContent={undefined} panelContent={undefined}>
        <div>TODO: Show dashboards</div>
      </PageContentSection>
    </React.Fragment>
  );
};

export default Profile;
