import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';

interface IJaegerPageToolbarSelectProps {
  isOperations: boolean;
  placeholder: string;
  items: string[];
  selectedItem: string;
  selectItem: (item: string) => void;
}

// JaegerPageToolbarSelect provides a select box for the services and operations for Jaeger. The "isOperations" value is
// needed to provide a special handling, when the user doesn't want to specify an operation, but has selected one
// already. For that we have the special 'All Operations' handling, which is only used within this component. If the
// user selects this item, the selectItem function in the parent component will ignore it.
const JaegerPageToolbarSelect: React.FunctionComponent<IJaegerPageToolbarSelectProps> = ({
  isOperations,
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

  const options =
    isOperations && items.length > 0
      ? [
          <SelectOption key={-1} value="All Operations" />,
          ...items.map((item, index) => <SelectOption key={index} value={item} />),
        ]
      : items.map((item, index) => <SelectOption key={index} value={item} />);

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel={placeholder}
      placeholderText={placeholder}
      onToggle={(): void => setShow(!show)}
      onSelect={changeItem}
      selections={isOperations && selectedItem === '' && items.length > 0 ? 'All Operations' : selectedItem}
      isOpen={show}
    >
      {options}
    </Select>
  );
};

export default JaegerPageToolbarSelect;
