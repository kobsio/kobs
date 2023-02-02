import { SimpleList, SimpleListGroup, SimpleListItem } from '@patternfly/react-core';
import React from 'react';

import LogsFieldsItem from './LogsFieldsItem';

export interface ILogsFieldsProps {
  fields?: { name: string }[];
  selectedFields?: { name: string }[];
  selectField: (field: { name: string }) => void;
  changeFieldOrder: (oldIndex: number, newIndex: number) => void;
}

// LogsFields is used to show the list of parsed and selected fields. When a user selects a field from the fields list,
// this field is added to the list of selected fields. When the user selects a field from the selected fields list this
// field will be removed from this list.
const LogsFields: React.FunctionComponent<ILogsFieldsProps> = ({
  fields,
  selectedFields,
  selectField,
  changeFieldOrder,
}: ILogsFieldsProps) => {
  if ((!selectedFields || selectedFields.length === 0) && (!fields || fields.length === 0)) {
    return null;
  }

  return (
    <SimpleList className="pf-u-text-wrap pf-u-text-break-word" aria-label="Fields" isControlled={false}>
      {selectedFields && selectedFields.length > 0 ? (
        <SimpleListGroup title="Selected Fields">
          {selectedFields.map((selectedField, index) => (
            <LogsFieldsItem
              key={index}
              index={index}
              length={selectedFields.length}
              field={selectedField}
              selectField={selectField}
              changeFieldOrder={changeFieldOrder}
            />
          ))}
        </SimpleListGroup>
      ) : null}

      {fields && fields.length > 0 ? (
        <SimpleListGroup title="Fields">
          {fields.map((field, index) => (
            <SimpleListItem key={index} onClick={(): void => selectField(field)} isActive={false}>
              {field.name}
            </SimpleListItem>
          ))}
        </SimpleListGroup>
      ) : null}
    </SimpleList>
  );
};

export default LogsFields;
