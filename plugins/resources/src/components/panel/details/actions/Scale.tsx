import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  NumberInput,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { IResource } from '@kobsio/plugin-core';

interface IScaleProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const Scale: React.FunctionComponent<IScaleProps> = ({ request, resource, show, setShow }: IScaleProps) => {
  const [replicas, setReplicas] = useState<number>(resource.props?.spec?.replicas || 0);
  const [error, setError] = useState<string>('');

  const handleScale = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&resource=${request.resource}&path=${request.path}`,
        {
          body: JSON.stringify([{ op: 'replace', path: '/spec/replicas', value: replicas }]),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    setReplicas(resource.props?.spec?.replicas || 0);
  }, [resource.props?.spec?.replicas]);

  if (error) {
    return (
      <div style={{ height: '100%', minHeight: '100%' }}>
        <AlertGroup isToast={true}>
          <Alert
            isLiveRegion={true}
            variant={AlertVariant.danger}
            title={error}
            actionClose={<AlertActionCloseButton onClick={(): void => setError('')} />}
          />
        </AlertGroup>
      </div>
    );
  }

  return (
    <Modal
      variant={ModalVariant.small}
      title={`Scale ${resource.name.title}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button
          key="scale"
          variant={replicas === 0 ? ButtonVariant.danger : ButtonVariant.primary}
          onClick={handleScale}
        >
          Scale
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Set new replica count for <b>{resource.name.title}</b> (
        {resource.namespace ? `${resource.namespace.title} ${resource.cluster.title}` : resource.cluster.title}):
      </p>
      <NumberInput
        value={replicas}
        min={0}
        onMinus={(): void => setReplicas(replicas - 1)}
        onChange={(event): void => {
          const target = event.target as HTMLInputElement;
          setReplicas(Number(target.value));
        }}
        onPlus={(): void => setReplicas(replicas + 1)}
        inputName="replicas"
        inputAriaLabel="replicas"
        minusBtnAriaLabel="minus"
        plusBtnAriaLabel="plus"
      />
    </Modal>
  );
};

export default Scale;
