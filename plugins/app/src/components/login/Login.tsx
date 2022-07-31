import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
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

import logo from '../../assets/logo.png';

import '../../assets/login.css';

const images = {
  lg: pfbg1200,
  sm: pfbg768,
  sm2x: pfbg768at2x,
  xs: pfbg576,
  xs2x: pfbg576at2x,
};

interface ILoginProps {
  refetch: () => void;
}

const Login: React.FunctionComponent<ILoginProps> = ({ refetch }: ILoginProps) => {
  const [state, setState] = useState<{ email: string; error: string; isLoading: boolean; password: string }>({
    email: '',
    error: '',
    isLoading: false,
    password: '',
  });

  const login = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    e.preventDefault();
    setState({ ...state, error: '', isLoading: true });

    try {
      const response = await fetch('/api/auth/login', {
        body: JSON.stringify({ email: state.email, password: state.password }),
        method: 'post',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setState({ ...state, error: '', isLoading: false });
        refetch();
        return;
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
      className="kobsio-login"
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
      loginTitle="Log in to your account"
      loginSubtitle="Enter your username and password or use the OIDC provider."
      socialMediaLoginContent={
        <React.Fragment>
          <Divider className="pf-u-mb-xl" />
          <Button
            isBlock={true}
            isDisabled={state.isLoading}
            variant={ButtonVariant.primary}
            component="a"
            href="/api/auth/oidc"
          >
            Log in via OIDC provider
          </Button>
        </React.Fragment>
      }
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
        loginButtonLabel="Log in"
        isLoginButtonDisabled={state.isLoading}
        onLoginButtonClick={login}
        showHelperText={state.error !== ''}
        helperText={
          state.error && <Alert variant={AlertVariant.danger} isInline={true} isPlain={true} title={state.error} />
        }
      />
    </LoginPage>
  );
};

export default Login;
