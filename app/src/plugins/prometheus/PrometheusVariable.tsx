import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

import { Variable } from 'proto/prometheus_grpc_web_pb';

interface IPrometheusVariableProps {
  variable: Variable.AsObject;
  selectValue: (value: string) => void;
}

// PrometheusVariable is the component tp render a single variable in a Select component. When the user selects a new
// value, via use the passed in selectValue function to change the variable.
const PrometheusVariable: React.FunctionComponent<IPrometheusVariableProps> = ({
  variable,
  selectValue,
}: IPrometheusVariableProps) => {
  const [show, setShow] = useState<boolean>(false);

  // onSelect is called, when the user selects a value for a variable. In this case we change the variable value and we
  // close the select box.
  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    selectValue(value as string);
    setShow(false);
  };

  const group = [
    <SelectGroup label={variable.name} key="variable">
      {variable.valuesList.map((value, index) => (
        <SelectOption key={index} value={value} />
      ))}
    </SelectGroup>,
  ];

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel={`Select ${variable.name}`}
      placeholderText={`Select ${variable.name}`}
      onToggle={(): void => setShow(!show)}
      onSelect={onSelect}
      selections={variable.value}
      isOpen={show}
    >
      {group}
    </Select>
  );
};

export default PrometheusVariable;
