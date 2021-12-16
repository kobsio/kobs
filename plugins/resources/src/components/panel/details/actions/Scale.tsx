import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant, NumberInput } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';

import { IResource, IResourceRow } from '@kobsio/plugin-core';
import { IAlert } from '../../../../utils/interfaces';

interface IScaleProps {
  request: IResource;
  resource: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const Scale: React.FunctionComponent<IScaleProps> = ({
  request,
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: IScaleProps) => {
  const [replicas, setReplicas] = useState<number>(resource.props?.spec?.replicas || 0);

  const handleScale = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster}${
          resource.namespace ? `&namespace=${resource.namespace}` : ''
        }&name=${resource.name}&resource=${request.resource}&path=${request.path}`,
        {
          body: JSON.stringify([{ op: 'replace', path: '/spec/replicas', value: replicas }]),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `Scale replicas for ${resource.name} to ${replicas}`, variant: AlertVariant.success });
        refetch();
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      setShow(false);
      setAlert({ title: err.message, variant: AlertVariant.danger });
    }
  };

  useEffect(() => {
    setReplicas(resource.props?.spec?.replicas || 0);
  }, [resource.props?.spec?.replicas]);

  return (
    <Modal
      variant={ModalVariant.small}
      title={`Scale ${resource.name}`}
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
        Set new replica count for <b>{resource.name}</b> (
        {resource.namespace ? `${resource.namespace} ${resource.cluster}` : resource.cluster}):
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
