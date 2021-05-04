import { Card, CardBody, DescriptionList } from '@patternfly/react-core';
import React from 'react';

import { IDocument, IKeyValue } from 'plugins/elasticsearch/helpers';
import ElasticsearchLogsDocumentOverviewItem from 'plugins/elasticsearch/ElasticsearchLogsDocumentOverviewItem';

// getKeyValues creates an array with all keys and values of the document.
const getKeyValues = (obj: IDocument, prefix = ''): IKeyValue[] => {
  return Object.keys(obj).reduce((res: IKeyValue[], el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeyValues(obj[el], prefix + el + '.')];
    }
    return [...res, { key: prefix + el, value: obj[el] }];
  }, []);
};

export interface IElasticsearchLogsDocumentOverviewProps {
  document: IDocument;
  showActions: boolean;
}

// ElasticsearchLogsDocumentOverview renders a list of all keys and their values in a description list. For that we have
// to generate a fields list via the getKeyValues function first.
const ElasticsearchLogsDocumentOverview: React.FunctionComponent<IElasticsearchLogsDocumentOverviewProps> = ({
  document,
  showActions,
}: IElasticsearchLogsDocumentOverviewProps) => {
  const fields = getKeyValues(document['_source']);

  return (
    <Card>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word">
          {fields.map((field) => (
            <ElasticsearchLogsDocumentOverviewItem key={field.key} field={field} showActions={showActions} />
          ))}
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default ElasticsearchLogsDocumentOverview;
