import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant, NumberInput } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';

import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

interface IScaleProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const Scale: React.FunctionComponent<IScaleProps> = ({
  resource,
  resourceData,
  show,
  setShow,
  setAlert,
}: IScaleProps) => {
  const [replicas, setReplicas] = useState<number>(resourceData.props?.spec?.replicas || 0);

  const handleScale = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&resource=${resource.resource}&path=${resource.path}`,
        {
          body: JSON.stringify([{ op: 'replace', path: '/spec/replicas', value: replicas }]),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `Scale replicas for ${resourceData.name} to ${replicas}`, variant: AlertVariant.success });
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
    setReplicas(resourceData.props?.spec?.replicas || 0);
  }, [resourceData.props?.spec?.replicas]);

  return (
    <Modal
      variant={ModalVariant.small}
      title={`Scale ${resourceData.name}`}
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
        Set new replica count for <b>{resourceData.name}</b> (
        {resourceData.namespace ? `${resourceData.namespace} ${resourceData.cluster}` : resourceData.cluster}):
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
