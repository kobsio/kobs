import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import React from 'react';

import { IDocument } from '../../../utils/interfaces';
import { getKeyValues } from '../../../utils/helpers';

export interface IDocumentProps {
  document: IDocument;
}

// Document renders a list of all keys and their values in a description list. For that we have to generate a fields
// list via the getKeyValues function first.
const Document: React.FunctionComponent<IDocumentProps> = ({ document }: IDocumentProps) => {
  const fields = getKeyValues(document['_source']);

  return (
    <Card>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word">
          {fields.map((field) => (
            <DescriptionListGroup key={field.key}>
              <DescriptionListTerm>{field.key}</DescriptionListTerm>
              <DescriptionListDescription>{field.value}</DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default Document;
