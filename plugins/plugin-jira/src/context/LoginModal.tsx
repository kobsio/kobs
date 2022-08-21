import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance } from '@kobsio/shared';

interface ILoginModalProps {
  instance: IPluginInstance;
  refetchAuth: () => void;
}

const LoginModal: React.FunctionComponent<ILoginModalProps> = ({ instance, refetchAuth }: ILoginModalProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [state, setState] = useState<{ email: string; error: string; isLoading: boolean; token: string }>({
    email: '',
    error: '',
    isLoading: false,
    token: '',
  });

  const handleLogin = async (): Promise<void> => {
    setState({ ...state, error: '', isLoading: true });

    try {
      const response = await fetch('/api/plugins/jira/auth/login', {
        body: JSON.stringify({ email: state.email, token: state.token }),
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'post',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setState({ ...state, error: '', isLoading: false });
        refetchAuth();
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
    <React.Fragment>
      <AlertActionLink onClick={(): void => setShow(true)}>Login</AlertActionLink>

      <Modal
        variant={ModalVariant.small}
        title="Login"
        isOpen={show}
        onClose={(): void => setShow(false)}
        actions={[
          <Button key="login" variant={ButtonVariant.primary} onClick={handleLogin}>
            Login
          </Button>,
          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
            Cancel
          </Button>,
        ]}
      >
        <TextInput
          value={state.email}
          onChange={(value): void => setState({ ...state, email: value })}
          aria-label="email"
          placeholder="Email"
        />
        <p>&nbsp;</p>
        <TextInput
          value={state.token}
          onChange={(value): void => setState({ ...state, token: value })}
          aria-label="token"
          placeholder="Token"
          type="password"
        />
        <p>&nbsp;</p>
        {state.error && <Alert variant={AlertVariant.danger} isInline={true} isPlain={true} title={state.error} />}
      </Modal>
    </React.Fragment>
  );
};

export default LoginModal;
