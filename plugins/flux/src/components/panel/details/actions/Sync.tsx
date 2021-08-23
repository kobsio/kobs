import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';
import { compare } from 'fast-json-patch';

import { IAlert } from '../../../../utils/interfaces';
import { IResource } from '@kobsio/plugin-core';

interface ISyncProps {
  request: IResource;
  resource: IRow;
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
  request,
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: ISyncProps) => {
  const handleSync = async (): Promise<void> => {
    try {
      const now = new Date();
      const copy = JSON.parse(JSON.stringify(resource.props));

      if (copy.metadata && copy.metadata) {
        if (copy.metadata.annotations) {
          copy.metadata.annotations['reconcile.fluxcd.io/requestedAt'] = now.toJSON();
        } else {
          copy.metadata.annotations = { 'reconcile.fluxcd.io/requestedAt': now.toJSON() };
        }
      }

      const diff = compare(resource.props, copy);

      const response = await fetch(
        `/api/plugins/resources/resources?cluster=${resource.cluster.title}${
          resource.namespace ? `&namespace=${resource.namespace.title}` : ''
        }&name=${resource.name.title}&resource=${request.resource}&path=${request.path}`,
        {
          body: JSON.stringify(diff),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resource.name.title} is syncing`, variant: AlertVariant.success });
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
      title={`Sync ${resource.name.title}`}
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
        Do you really want to sync <b>{resource.name.title}</b> (
        {resource.namespace ? `${resource.namespace.title}/${resource.cluster.title}` : resource.cluster.title})?
      </p>
    </Modal>
  );
};

export default Sync;
