import { Card, SimpleList, SimpleListGroup, SimpleListItem } from '@patternfly/react-core';
import React from 'react';

export interface IElasticsearchLogsFieldsProps {
  fields: string[];
  selectedFields: string[];
  selectField: (field: string) => void;
}

// ElasticsearchLogsFields is used to show the list of parsed and selected fields. When a user selects a field from the
// fields list, this field is added to the list of selected fields. When the user selects a field from the selected
// fields list this field will be removed from this list.
const ElasticsearchLogsFields: React.FunctionComponent<IElasticsearchLogsFieldsProps> = ({
  fields,
  selectedFields,
  selectField,
}: IElasticsearchLogsFieldsProps) => {
  if (selectedFields.length === 0 && fields.length === 0) {
    return null;
  }

  return (
    <Card>
      <SimpleList aria-label="Fields" isControlled={false}>
        {selectedFields.length > 0 ? (
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
    </Card>
  );
};

export default ElasticsearchLogsFields;
