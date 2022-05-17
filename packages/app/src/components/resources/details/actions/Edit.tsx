import { AlertVariant, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { compare } from 'fast-json-patch';
import yaml from 'js-yaml';

import { Editor } from '@kobsio/shared';
import { IAlert } from '../../utils/interfaces';
import { IResource } from '../../../../resources/clusters';
import { IResourceRow } from '../../utils/tabledata';

interface IEditProps {
  resource: IResource;
  resourceData: IResourceRow;
  show: boolean;
  setShow: (value: boolean) => void;
  setAlert: (alert: IAlert) => void;
}

const Edit: React.FunctionComponent<IEditProps> = ({ resource, resourceData, show, setShow, setAlert }: IEditProps) => {
  const [value, setValue] = useState<string>(yaml.dump(resourceData.props));

  const handleEdit = async (): Promise<void> => {
    try {
      const parsedValue = yaml.load(value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diff = compare(resourceData.props, parsedValue as any);

      const response = await fetch(
        `/api/resources?satellite=${resourceData.satellite}&cluster=${resourceData.cluster}${
          resourceData.namespace ? `&namespace=${resourceData.namespace}` : ''
        }&name=${resourceData.name}&resource=${resource.resource}&path=${resource.path}`,
        {
          body: JSON.stringify(diff),
          method: 'put',
        },
      );
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setShow(false);
        setAlert({ title: `${resourceData.name} was saved`, variant: AlertVariant.success });
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
    setValue(yaml.dump(resourceData.props));
  }, [resourceData.props]);

  return (
    <Modal
      variant={ModalVariant.large}
      title={`Edit ${resourceData.name}`}
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
