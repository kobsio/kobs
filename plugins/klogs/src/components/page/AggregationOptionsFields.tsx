import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { IAggregationOptions } from '../../utils/interfaces';

interface IAggregationOptionsFieldsProps {
  options: IAggregationOptions;
  setOptions: (data: IAggregationOptions) => void;
}

const AggregationOptionsFields: React.FunctionComponent<IAggregationOptionsFieldsProps> = ({
  options,
  setOptions,
}: IAggregationOptionsFieldsProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [field, setField] = useState<string>('');

  const addField = (): void => {
    setOptions({
      ...options,
      options: {
        ...options.options,
        breakDownByFields: options.options?.breakDownByFields
          ? [...options.options?.breakDownByFields, field]
          : [field],
      },
    });
    setField('');
    setShow(false);
  };

  const removeField = (field: string): void => {
    if (options.options?.breakDownByFields) {
      let tmpFields = [...options.options?.breakDownByFields];
      tmpFields = tmpFields.filter((f) => f !== field);

      setOptions({ ...options, options: { ...options.options, breakDownByFields: tmpFields } });
    }
  };

  return (
    <div>
      {options.options?.breakDownByFields?.map((field) => (
        <Card
          key={field}
          style={{ cursor: 'pointer' }}
          isCompact={true}
          isFlat={true}
          onClick={(): void => removeField(field)}
        >
          <CardBody>{field}</CardBody>
        </Card>
      ))}
      <Card style={{ cursor: 'pointer' }} isCompact={true} isFlat={true} onClick={(): void => setShow(true)}>
        <CardBody>Add field</CardBody>
      </Card>

      <Modal
        variant={ModalVariant.small}
        title="Add Field"
        isOpen={show}
        onClose={(): void => setShow(false)}
        actions={[
          <Button key="add" variant={ButtonVariant.primary} onClick={(): void => addField()}>
            Add Field
          </Button>,
          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form isHorizontal={true}>
          <FormGroup label="Field" fieldId="form-field">
            <TextInput
              value={field}
              isRequired
              type="text"
              id="form-field"
              aria-describedby="form-field"
              name="form-field"
              onChange={(value): void => setField(value)}
            />
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};

export default AggregationOptionsFields;
