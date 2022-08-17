import {
  Alert,
  AlertVariant,
  ListItem,
  ListVariant,
  LoginFooterItem,
  LoginForm,
  LoginPage,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import pfbg1200 from '@patternfly/patternfly/assets/images/pfbg_1200.jpg';
import pfbg576 from '@patternfly/patternfly/assets/images/pfbg_576.jpg';
import pfbg576at2x from '@patternfly/patternfly/assets/images/pfbg_576@2x.jpg';
import pfbg768 from '@patternfly/patternfly/assets/images/pfbg_768.jpg';
import pfbg768at2x from '@patternfly/patternfly/assets/images/pfbg_768@2x.jpg';

import SigninOIDC from './SigninOIDC';

import logo from '../../assets/logo.png';

import '../../assets/signin.css';

const images = {
  lg: pfbg1200,
  sm: pfbg768,
  sm2x: pfbg768at2x,
  xs: pfbg576,
  xs2x: pfbg576at2x,
};

const Signin: React.FunctionComponent = () => {
  const [state, setState] = useState<{ email: string; error: string; isLoading: boolean; password: string }>({
    email: '',
    error: '',
    isLoading: false,
    password: '',
  });

  const signin = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    e.preventDefault();
    setState({ ...state, error: '', isLoading: true });

    try {
      const response = await fetch('/api/auth/signin', {
        body: JSON.stringify({ email: state.email, password: state.password }),
        method: 'post',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setState({ ...state, error: '', isLoading: false });

        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect');
        window.location.replace(
          redirect && redirect.startsWith(window.location.origin) ? redirect.replace(window.location.origin, '') : '/',
        );
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setState({ ...state, error: err.message, isLoading: false });
    }
  };

  return (
    <LoginPage
      className="kobsio-signin"
      footerListVariants={ListVariant.inline}
      brandImgSrc={logo}
      brandImgAlt="kobs logo"
      backgroundImgSrc={images}
      backgroundImgAlt="Images"
      footerListItems={
        <React.Fragment>
          <ListItem>
            <LoginFooterItem href="https://kobs.io/" target="_blank">
              Help
            </LoginFooterItem>
          </ListItem>
        </React.Fragment>
      }
      textContent="Welcome to kobs. Your application-centric observability platform for Kubernetes and Cloud workloads."
      loginTitle="Sign in to your account"
      loginSubtitle="Enter your username and password or use the OIDC provider."
      socialMediaLoginContent={<SigninOIDC isLoading={state.isLoading} />}
      signUpForAccountMessage={undefined}
      forgotCredentials={undefined}
    >
      <LoginForm
        usernameLabel="Email"
        usernameValue={state.email}
        onChangeUsername={(value: string): void => setState({ ...state, email: value })}
        isShowPasswordEnabled={true}
        passwordLabel="Password"
        passwordValue={state.password}
        onChangePassword={(value: string): void => setState({ ...state, password: value })}
        loginButtonLabel="Sign in"
        isLoginButtonDisabled={state.isLoading}
        onLoginButtonClick={signin}
        showHelperText={state.error !== ''}
        helperText={
          state.error && <Alert variant={AlertVariant.danger} isInline={true} isPlain={true} title={state.error} />
        }
      />
    </LoginPage>
  );
};

export default Signin;
