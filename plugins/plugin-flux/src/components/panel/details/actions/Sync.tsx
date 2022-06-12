import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React from 'react';

import { IAlert, TType } from '../../../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface ISyncProps {
  instance: IPluginInstance;
  cluster: string;
  type: TType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

// The Sync component can be used to trigger a reconciliation of the given Flux resource via the
// "reconcile.fluxcd.io/requestedAt" annotation. outside of the defined schedule. Despite the name, the value is not
// interpreted as a timestamp, and any change in value shall trigger a reconciliation.
// See: https://pkg.go.dev/github.com/fluxcd/pkg/apis/meta#pkg-constants
const Sync: React.FunctionComponent<ISyncProps> = ({
  instance,
  cluster,
  type,
  item,
  show,
  setShow,
  setAlert,
  refetch,
}: ISyncProps) => {
  const handleSync = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/plugins/flux/sync?cluster=${cluster}&namespace=${item.metadata.namespace}&name=${item.metadata.name}&resource=${type}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${item.metadata.name} is syncing`, variant: AlertVariant.success });
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
      title={`Sync ${item.metadata.name}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="sync" variant={ButtonVariant.primary} onClick={handleSync}>
          Sync
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <p>
        Do you really want to sync <b>{item.metadata.name}</b> ({item.metadata.namespace})?
      </p>
    </Modal>
  );
};

export default Sync;
