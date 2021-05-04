import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import React, { useState } from 'react';

import ElasticsearchLogsActions from 'plugins/elasticsearch/ElasticsearchLogsActions';
import { IKeyValue } from 'plugins/elasticsearch/helpers';

interface IElasticsearchLogsDocumentOverviewItemProps {
  field: IKeyValue;
  showActions: boolean;
}

// Item is the component to render a single field from the generated key/values list. When the user hovers over the
// title/key of the description list, we will show some actions, which can be used to include/exclude the value from the
// search or to add it as column to the table.
const ElasticsearchLogsDocumentOverviewItem: React.FunctionComponent<IElasticsearchLogsDocumentOverviewItemProps> = ({
  field,
  showActions,
}: IElasticsearchLogsDocumentOverviewItemProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm onMouseEnter={(): void => setShow(true)} onMouseLeave={(): void => setShow(false)}>
        {field.key}
        {showActions && show ? <ElasticsearchLogsActions field={field} /> : null}
      </DescriptionListTerm>
      <DescriptionListDescription>{field.value}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ElasticsearchLogsDocumentOverviewItem;
