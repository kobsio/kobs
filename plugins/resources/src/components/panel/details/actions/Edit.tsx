import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { compare } from 'fast-json-patch';
import yaml from 'js-yaml';

import { Editor, IResource } from '@kobsio/plugin-core';
import { IAlert } from '../../../../utils/interfaces';

interface IEditProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
  refetch: () => void;
}

const Edit: React.FunctionComponent<IEditProps> = ({
  request,
  resource,
  show,
  setShow,
  setAlert,
  refetch,
}: IEditProps) => {
  const [value, setValue] = useState<string>(yaml.dump(resource.props));

  const handleEdit = async (): Promise<void> => {
    try {
      const parsedValue = yaml.load(value);
      const diff = compare(resource.props, parsedValue);

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
        setAlert({ title: `${resource.name.title} was saved`, variant: AlertVariant.success });
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
    setValue(yaml.dump(resource.props));
  }, [resource.props]);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Edit ${resource.name.title}`}
      isOpen={show}
      onClose={(): void => setShow(false)}
      actions={[
        <Button key="edit" variant={ButtonVariant.primary} onClick={handleEdit}>
          Save
        </Button>,
        <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
          Cancel
        </Button>,
      ]}
    >
      <Editor value={value} mode="yaml" readOnly={false} onChange={setValue} />
    </Modal>
  );
};

export default Edit;
