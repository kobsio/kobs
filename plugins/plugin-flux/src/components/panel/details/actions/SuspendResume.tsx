import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React from 'react';

import { IAlert, TType } from '../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import { resources } from '../../../../utils/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getJSONPatch = (item: any, suspendResume: 'suspend' | 'resume'): string => {
  if (suspendResume === 'suspend') {
    if (item?.suspend) {
      return JSON.stringify([{ op: 'replace', path: '/spec/suspend', value: true }]);
    }

    return JSON.stringify([{ op: 'add', path: '/spec/suspend', value: true }]);
  } else {
    if (item?.suspend) {
      return JSON.stringify([{ op: 'replace', path: '/spec/suspend', value: false }]);
    }

    return JSON.stringify([{ op: 'add', path: '/spec/suspend', value: false }]);
  }
};

interface ISuspendResumeProps {
  instance: IPluginInstance;
  cluster: string;
  type: TType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  suspendResume: 'suspend' | 'resume';
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const SuspendResume: React.FunctionComponent<ISuspendResumeProps> = ({
  instance,
  cluster,
  type,
  item,
  suspendResume,
  show,
  setShow,
  setAlert,
  refetch,
}: ISuspendResumeProps) => {
  const handleAction = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/resources?satellite=${instance.satellite}&cluster=${cluster}&namespace=${item.metadata.namespace}&name=${item.metadata.name}&resource=${resources[type].resource}&path=${resources[type].path}`,
        {
          body: getJSONPatch(item, suspendResume),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${item.metadata.name} was ${suspendResume}ed`, variant: AlertVariant.success });
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

  return (
    <Modal
      variant={ModalVariant.small}
      title={suspendResume === 'suspend' ? `Suspend ${item.metadata.name}` : `Resume ${item.metadata.name}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="action" variant={ButtonVariant.primary} onClick={handleAction}>
          {suspendResume === 'suspend' ? 'Suspend' : 'Resume'}
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Do you really want to {suspendResume} <b>{item.metadata.name}</b> ({item.metadata.namespace})?
      </p>
    </Modal>
  );
};

export default SuspendResume;
