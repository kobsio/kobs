import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';

import AggregationOptionsFields from './AggregationOptionsFields';
import AggregationOptionsFilters from './AggregationOptionsFilters';
import { IAggregationOptions } from '../../utils/interfaces';

interface IAggregationOptionsProps {
  options: IAggregationOptions;
  setOptions: (data: IAggregationOptions) => void;
  changeOptions: () => void;
}

const AggregationOptions: React.FunctionComponent<IAggregationOptionsProps> = ({
  options,
  setOptions,
  changeOptions,
}: IAggregationOptionsProps) => {
  return (
    <Card isCompact={true}>
      <CardBody>
        <Form>
          <FormSection>
            <FormGroup label="Chart" fieldId="vis-options-chart">
              <FormSelect
                value={options.chart}
                onChange={(value): void => setOptions({ ...options, chart: value })}
                id="vis-options-chart"
                name="vis-options-chart"
                aria-label="vis-options-chart"
              >
                <FormSelectOption value="pie" label="Pie Chart" />
                <FormSelectOption value="bar" label="Bar Chart" />
                <FormSelectOption value="line" label="Line Chart" />
                <FormSelectOption value="area" label="Area Chart" />
              </FormSelect>
            </FormGroup>
          </FormSection>

          {options.chart === 'pie' && (
            <FormSection>
              <FormGroup label="Slice by" fieldId="vis-options-sliceBy">
                <TextInput
                  value={options.options.sliceBy}
                  isRequired={true}
                  type="text"
                  id="vis-options-sliceBy"
                  aria-describedby="vis-options-sliceBy"
                  name="vis-options-sliceBy"
                  onChange={(value): void =>
                    setOptions({ ...options, options: { ...options.options, sliceBy: value } })
                  }
                />
              </FormGroup>

              <FormGroup label="Size by operation" fieldId="vis-options-sizeByOperation">
                <FormSelect
                  value={options.options.sizeByOperation}
                  onChange={(value): void =>
                    setOptions({ ...options, options: { ...options.options, sizeByOperation: value } })
                  }
                  id="vis-options-sizeByOperation"
                  name="vis-options-sizeByOperation"
                  aria-label="vis-options-sizeByOperation"
                >
                  <FormSelectOption value="count" label="count" />
                  <FormSelectOption value="min" label="min" />
                  <FormSelectOption value="max" label="max" />
                  <FormSelectOption value="sum" label="sum" />
                  <FormSelectOption value="avg" label="avg" />
                </FormSelect>
              </FormGroup>

              {options.options.sizeByOperation !== undefined && options.options.sizeByOperation !== 'count' && (
                <FormGroup label="Size by field" fieldId="vis-options-sizeByField">
                  <TextInput
                    value={options.options.sizeByField}
                    isRequired={true}
                    type="text"
                    id="vis-options-sizeByField"
                    aria-describedby="vis-options-sizeByField"
                    name="vis-options-sizeByField"
                    onChange={(value): void =>
                      setOptions({ ...options, options: { ...options.options, sizeByField: value } })
                    }
                  />
                </FormGroup>
              )}
            </FormSection>
          )}

          {(options.chart === 'bar' || options.chart === 'line' || options.chart === 'area') && (
            <FormSection>
              <FormGroup label="Horizontal axis operation" fieldId="vis-options-horizontalAxisOperation">
                <FormSelect
                  value={options.options.horizontalAxisOperation}
                  onChange={(value): void =>
                    setOptions({ ...options, options: { ...options.options, horizontalAxisOperation: value } })
                  }
                  id="vis-options-horizontalAxisOperation"
                  name="vis-options-horizontalAxisOperation"
                  aria-label="vis-options-horizontalAxisOperation"
                >
                  <FormSelectOption value="time" label="time" />
                  {options.chart === 'bar' && <FormSelectOption value="top" label="top" />}
                </FormSelect>
              </FormGroup>

              {options.chart === 'bar' && options.options.horizontalAxisOperation === 'top' && (
                <FormGroup label="Horizontal axis field" fieldId="vis-options-horizontalAxisField">
                  <TextInput
                    value={options.options.horizontalAxisField}
                    isRequired={true}
                    type="text"
                    id="vis-options-horizontalAxisField"
                    aria-describedby="vis-options-horizontalAxisField"
                    name="vis-options-horizontalAxisField"
                    onChange={(value): void =>
                      setOptions({
                        ...options,
                        options: { ...options.options, horizontalAxisField: value },
                      })
                    }
                  />
                </FormGroup>
              )}

              {options.chart === 'bar' && options.options.horizontalAxisOperation === 'top' && (
                <FormGroup label="Horizontal axis order" fieldId="vis-options-horizontalAxisOrder">
                  <FormSelect
                    value={options.options.horizontalAxisOrder}
                    onChange={(value): void =>
                      setOptions({ ...options, options: { ...options.options, horizontalAxisOrder: value } })
                    }
                    id="vis-options-horizontalAxisOrder"
                    name="vis-options-horizontalAxisOrder"
                    aria-label="vis-options-horizontalAxisOrder"
                  >
                    <FormSelectOption value="ascending" label="ascending" />
                    <FormSelectOption value="descending" label="descending" />
                  </FormSelect>
                </FormGroup>
              )}

              {options.chart === 'bar' && options.options.horizontalAxisOperation === 'top' && (
                <FormGroup label="Horizontal axis limit" fieldId="vis-options-horizontalAxisLimit">
                  <TextInput
                    value={options.options.horizontalAxisLimit}
                    isRequired={true}
                    type="text"
                    id="vis-options-horizontalAxisLimit"
                    aria-describedby="vis-options-horizontalAxisLimit"
                    name="vis-options-horizontalAxisLimit"
                    onChange={(value): void =>
                      setOptions({
                        ...options,
                        options: { ...options.options, horizontalAxisLimit: value },
                      })
                    }
                  />
                </FormGroup>
              )}
            </FormSection>
          )}

          {(options.chart === 'bar' || options.chart === 'line' || options.chart === 'area') && (
            <FormSection>
              <FormGroup label="Vertical axis operation" fieldId="vis-options-verticalAxisOperation">
                <FormSelect
                  value={options.options.verticalAxisOperation}
                  onChange={(value): void =>
                    setOptions({ ...options, options: { ...options.options, verticalAxisOperation: value } })
                  }
                  id="vis-options-verticalAxisOperation"
                  name="vis-options-verticalAxisOperation"
                  aria-label="vis-options-verticalAxisOperation"
                >
                  <FormSelectOption value="count" label="count" />
                  <FormSelectOption value="min" label="min" />
                  <FormSelectOption value="max" label="max" />
                  <FormSelectOption value="sum" label="sum" />
                  <FormSelectOption value="avg" label="avg" />
                </FormSelect>
              </FormGroup>

              {options.options.verticalAxisOperation !== undefined &&
                options.options.verticalAxisOperation !== 'count' && (
                  <FormGroup label="Vertical axis field" fieldId="vis-options-verticalAxisField">
                    <TextInput
                      value={options.options.verticalAxisField}
                      isRequired={true}
                      type="text"
                      id="vis-options-verticalAxisField"
                      aria-describedby="vis-options-verticalAxisField"
                      name="vis-options-verticalAxisField"
                      onChange={(value): void =>
                        setOptions({ ...options, options: { ...options.options, verticalAxisField: value } })
                      }
                    />
                  </FormGroup>
                )}
            </FormSection>
          )}

          {(options.chart === 'bar' || options.chart === 'line' || options.chart === 'area') && (
            <FormSection>
              <b>Break down by fields</b>
              <AggregationOptionsFields options={options} setOptions={setOptions} />
              <b>Break down by filters</b>
              <AggregationOptionsFilters options={options} setOptions={setOptions} />
            </FormSection>
          )}

          <Button type="button" variant="primary" onClick={(): void => changeOptions()}>
            Visualize
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AggregationOptions;
