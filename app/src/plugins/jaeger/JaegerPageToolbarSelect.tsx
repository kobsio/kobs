import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

interface IJaegerPageToolbarSelectProps {
  placeholder: string;
  items: string[];
  selectedItem: string;
  selectItem: (item: string) => void;
}

// JaegerPageToolbarSelect provides a select box for the services and operations for Jaeger.
const JaegerPageToolbarSelect: React.FunctionComponent<IJaegerPageToolbarSelectProps> = ({
  placeholder,
  items,
  selectedItem,
  selectItem,
}: IJaegerPageToolbarSelectProps) => {
  const [show, setShow] = useState<boolean>(false);

  // changeItem changes the service/operations and the closes the select options.
  const changeItem = (
    event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined,
  ): void => {
    selectItem(value as string);
    setShow(false);
  };

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel={placeholder}
      placeholderText={placeholder}
      onToggle={(): void => setShow(!show)}
      onSelect={changeItem}
      selections={selectedItem}
      isOpen={show}
    >
      {items.map((item, index) => (
        <SelectOption key={index} value={item} />
      ))}
    </Select>
  );
};

export default JaegerPageToolbarSelect;
