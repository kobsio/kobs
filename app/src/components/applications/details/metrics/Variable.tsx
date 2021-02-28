import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

import { IApplicationMetricsVariable } from 'utils/proto';

interface IVariableProps {
  variable: IApplicationMetricsVariable;
  selectValue: (value: string) => void;
}

// Variable is the component tp render a single variable in a Select component. When the user selects a new value, via
// use the passed in selectValue function to change the variable.
const Variable: React.FunctionComponent<IVariableProps> = ({ variable, selectValue }: IVariableProps) => {
  const [show, setShow] = useState<boolean>(false);

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
  ): void => {
    selectValue(value as string);
    setShow(false);
  };

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
      {variable.values.map((value, index) => (
        <SelectOption key={index} value={value} />
      ))}
    </Select>
  );
};

export default Variable;
