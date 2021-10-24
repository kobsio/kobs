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

import { IAggregationOptions, IAggregationOptionsAggregationFilter } from '../../utils/interfaces';

interface IAggregationOptionsFiltersProps {
  options: IAggregationOptions;
  setOptions: (data: IAggregationOptions) => void;
}

const AggregationOptionsFilters: React.FunctionComponent<IAggregationOptionsFiltersProps> = ({
  options,
  setOptions,
}: IAggregationOptionsFiltersProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [state, setState] = useState<IAggregationOptionsAggregationFilter>({ field: '', operator: '', value: '' });

  const addFilter = (): void => {
    setOptions({
      ...options,
      options: {
        ...options.options,
        breakDownByFilters: options.options?.breakDownByFilters
          ? [...options.options?.breakDownByFilters, state]
          : [state],
      },
    });
    setState({ field: '', operator: '', value: '' });
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
          <CardBody>
            {filter.field} {filter.operator} {filter.value}
          </CardBody>
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
          <FormGroup label="Field" fieldId="form-field">
            <TextInput
              value={state.field}
              isRequired
              type="text"
              id="form-field"
              aria-describedby="form-field"
              name="form-field"
              onChange={(value): void => setState({ ...state, field: value })}
            />
          </FormGroup>

          <FormGroup label="Operator" fieldId="form-operator">
            <TextInput
              value={state.operator}
              isRequired
              type="text"
              id="form-operator"
              aria-describedby="form-operator"
              name="form-operator"
              onChange={(value): void => setState({ ...state, operator: value })}
            />
          </FormGroup>

          <FormGroup label="Value" fieldId="form-value">
            <TextInput
              value={state.value}
              isRequired
              type="text"
              id="form-value"
              aria-describedby="form-value"
              name="form-value"
              onChange={(value): void => setState({ ...state, value: value })}
            />
          </FormGroup>
        </Form>
      </Modal>
    </div>
  );
};

export default AggregationOptionsFilters;
