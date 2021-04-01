import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import ElasticsearchPreviewChart from 'plugins/elasticsearch/ElasticsearchPreviewChart';
import { IPluginProps } from 'utils/plugins';

const ElasticsearchPreview: React.FunctionComponent<IPluginProps> = ({ name, description, plugin }: IPluginProps) => {
  if (
    !plugin.elasticsearch ||
    plugin.elasticsearch.queriesList.length !== 1 ||
    plugin.elasticsearch.queriesList[0].query === ''
  ) {
    return <Alert variant={AlertVariant.danger} isInline={true} title="Elasticsearch properties are invalid." />;
  }

  return <ElasticsearchPreviewChart name={name} query={plugin.elasticsearch.queriesList[0]} />;
};

export default ElasticsearchPreview;
