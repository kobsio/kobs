import { SimpleList, SimpleListGroup, SimpleListItem } from '@patternfly/react-core';
import React from 'react';

export interface IPageLogsFieldsProps {
  fields: string[];
  selectedFields?: string[];
  selectField: (field: string) => void;
}

// PageLogsFields is used to show the list of parsed and selected fields. When a user selects a field from the fields
// list, this field is added to the list of selected fields. When the user selects a field from the selected fields list
// this field will be removed from this list.
const PageLogsFields: React.FunctionComponent<IPageLogsFieldsProps> = ({
  fields,
  selectedFields,
  selectField,
}: IPageLogsFieldsProps) => {
  if ((!selectedFields || selectedFields.length === 0) && fields.length === 0) {
    return null;
  }

  return (
    <SimpleList className="pf-u-text-wrap pf-u-text-break-word" aria-label="Fields" isControlled={false}>
      {selectedFields && selectedFields.length > 0 ? (
        <SimpleListGroup title="Selected Fields">
          {selectedFields.map((selectedField, index) => (
            <SimpleListItem key={index} onClick={(): void => selectField(selectedField)} isActive={false}>
              {selectedField}
            </SimpleListItem>
          ))}
        </SimpleListGroup>
      ) : null}

      {fields.length > 0 ? (
        <SimpleListGroup title="Fields">
          {fields.map((field, index) => (
            <SimpleListItem key={index} onClick={(): void => selectField(field)} isActive={false}>
              {field}
            </SimpleListItem>
          ))}
        </SimpleListGroup>
      ) : null}
    </SimpleList>
  );
};

export default PageLogsFields;
