import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';

import { IVisualizationOptions } from '../../utils/interfaces';

interface IVisualizationOptionsProps {
  options: IVisualizationOptions;
  setOptions: (data: IVisualizationOptions) => void;
  changeOptions: () => void;
}

const VisualizationOptions: React.FunctionComponent<IVisualizationOptionsProps> = ({
  options,
  setOptions,
  changeOptions,
}: IVisualizationOptionsProps) => {
  return (
    <Card isCompact={true}>
      <CardBody>
        <Form>
          <FormGroup
            label="Operation Field"
            fieldId="vis-options-operation-field"
            helperText="Use single quotes for fields of type string, e.g. 'namespace'."
          >
            <TextInput
              value={options.operationField}
              isRequired={true}
              type="text"
              id="vis-options-operation-field"
              aria-describedby="vis-options-operation-field"
              name="vis-options-operation-field"
              onChange={(value): void => setOptions({ ...options, operationField: value })}
            />
          </FormGroup>

          <FormGroup label="Operation" fieldId="vis-options-operation">
            <FormSelect
              value={options.operation}
              onChange={(value): void => setOptions({ ...options, operation: value })}
              id="vis-options-operation"
              name="vis-options-operation"
              aria-label="Operation"
            >
              <FormSelectOption value="count" label="count" />
              <FormSelectOption value="min" label="min" />
              <FormSelectOption value="max" label="max" />
              <FormSelectOption value="sum" label="sum" />
              <FormSelectOption value="avg" label="avg" />
            </FormSelect>
          </FormGroup>

          <FormGroup
            label="Group By"
            fieldId="vis-options-group-by"
            helperText="Use single quotes for fields of type string, e.g. 'namespace'."
          >
            <TextInput
              value={options.groupBy}
              isRequired={true}
              type="text"
              id="vis-options-group-by"
              aria-describedby="vis-options-group-by"
              name="vis-options-group-by"
              onChange={(value): void => setOptions({ ...options, groupBy: value })}
            />
          </FormGroup>

          <FormGroup label="Order" fieldId="vis-options-order">
            <FormSelect
              value={options.order}
              onChange={(value): void => setOptions({ ...options, order: value })}
              id="vis-options-order"
              name="vis-options-order"
              aria-label="Order"
            >
              <FormSelectOption value="ascending" label="ascending" />
              <FormSelectOption value="descending" label="descending" />
            </FormSelect>
          </FormGroup>

          <FormGroup label="Limit" fieldId="vis-options-limit">
            <TextInput
              value={options.limit}
              isRequired={true}
              type="text"
              id="vis-options-limit"
              aria-describedby="vis-options-limit"
              name="vis-options-limit"
              onChange={(value): void => setOptions({ ...options, limit: value })}
            />
          </FormGroup>

          <FormGroup label="Chart" fieldId="vis-options-chart">
            <FormSelect
              value={options.chart}
              onChange={(value): void => setOptions({ ...options, chart: value })}
              id="vis-options-chart"
              name="vis-options-chart"
              aria-label="Chart"
            >
              <FormSelectOption value="bar" label="Bar Chart" />
              <FormSelectOption value="pie" label="Pie Chart" />
            </FormSelect>
          </FormGroup>

          <Button type="button" variant="primary" onClick={(): void => changeOptions()}>
            Visualize
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default VisualizationOptions;
