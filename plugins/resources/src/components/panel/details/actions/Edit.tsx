import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { IRow } from '@patternfly/react-table';
import { compare } from 'fast-json-patch';
import yaml from 'js-yaml';

import { Editor, IResource } from '@kobsio/plugin-core';

interface IEditProps {
  request: IResource;
  resource: IRow;
  show: boolean;
  setShow: (value: boolean) => void;
}

const Edit: React.FunctionComponent<IEditProps> = ({ request, resource, show, setShow }: IEditProps) => {
  const [value, setValue] = useState<string>(yaml.dump(resource.props));
  const [error, setError] = useState<string>('');

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
    setValue(yaml.dump(resource.props));
  }, [resource.props]);

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
