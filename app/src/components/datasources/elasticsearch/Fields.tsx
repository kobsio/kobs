import { SimpleList, SimpleListItem } from '@patternfly/react-core';
import React from 'react';

export interface IFieldsProps {
  fields: string[];
  selectedFields: string[];
  selectField: (field: string) => void;
  unselectField: (field: string) => void;
}

// Fields is used to show the list of parsed and selected fields. When a user selects a field from the fields list, this
// field is added to the list of selected fields. When the user selects a field from the selected fields list this field
// will be removed from this list.
const Fields: React.FunctionComponent<IFieldsProps> = ({
  fields,
  selectedFields,
  selectField,
  unselectField,
}: IFieldsProps) => {
  return (
    <React.Fragment>
      {selectedFields.length > 0 ? <p className="pf-u-font-size-xs pf-u-color-400">Selected Fields</p> : null}

      {selectedFields.length > 0 ? (
        <SimpleList aria-label="Selected Fields" isControlled={false}>
          {selectedFields.map((selectedField, index) => (
            <SimpleListItem key={index} onClick={(): void => unselectField(selectedField)} isActive={false}>
              {selectedField}
            </SimpleListItem>
          ))}
        </SimpleList>
      ) : null}

      {fields.length > 0 ? <p className="pf-u-font-size-xs pf-u-color-400">Fields</p> : null}

      {fields.length > 0 ? (
        <SimpleList aria-label="Fields" isControlled={false}>
          {fields.map((field, index) => (
            <SimpleListItem key={index} onClick={(): void => selectField(field)} isActive={false}>
              {field}
            </SimpleListItem>
          ))}
        </SimpleList>
      ) : null}
    </React.Fragment>
  );
};

export default Fields;
