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

interface IAggregationOptionsFiltersProps {
  options: IAggregationOptions;
  setOptions: (data: IAggregationOptions) => void;
}

const AggregationOptionsFilters: React.FunctionComponent<IAggregationOptionsFiltersProps> = ({
  options,
  setOptions,
}: IAggregationOptionsFiltersProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');

  const addFilter = (): void => {
    setOptions({
      ...options,
      options: {
        ...options.options,
        breakDownByFilters: options.options?.breakDownByFilters
          ? [...options.options?.breakDownByFilters, filter]
          : [filter],
      },
    });
    setFilter('');
    setShow(false);
  };

  const removeFilter = (index: number): void => {
    if (options.options?.breakDownByFilters) {
      const tmpFilters = [...options.options?.breakDownByFilters];
      tmpFilters.splice(index, 1);

      setOptions({ ...options, options: { ...options.options, breakDownByFilters: tmpFilters } });
    }
  };

  return (
    <div>
      {options.options?.breakDownByFilters?.map((filter, index) => (
        <Card
          key={index}
          style={{ cursor: 'pointer' }}
          isCompact={true}
          isFlat={true}
          onClick={(): void => removeFilter(index)}
        >
          <CardBody>{filter}</CardBody>
        </Card>
      ))}
      <Card style={{ cursor: 'pointer' }} isCompact={true} isFlat={true} onClick={(): void => setShow(true)}>
        <CardBody>Add filter</CardBody>
      </Card>

      <Modal
        variant={ModalVariant.small}
        title="Add Filter"
        isOpen={show}
        onClose={(): void => setShow(false)}
        actions={[
          <Button key="add" variant={ButtonVariant.primary} onClick={(): void => addFilter()}>
            Add Filter
          </Button>,
          <Button key="cancel" variant={ButtonVariant.link} onClick={(): void => setShow(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form isHorizontal={true}>
          <FormGroup label="Filter" fieldId="form-filter">
            <TextInput
              value={filter}
              isRequired={true}
              type="text"
              id="form-filter"
              aria-describedby="form-filter"
              name="form-filter"
              onChange={(value): void => setFilter(value)}
            />
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};

export default AggregationOptionsFilters;
