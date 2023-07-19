import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { Collections } from './Collections';
import { DBStats } from './DBStats';
import { OperationAggregate } from './OperationAggregate';
import { OperationCount } from './OperationCount';
import { OperationFind } from './OperationFind';
import { OperationFindOne } from './OperationFindOne';

import { example } from '../utils/utils';

interface IOptions {
  collectionName?: string;
  filter?: string;
  limit?: number;
  operation?: string;
  pipeline?: string;
  sort?: string;
}

const MongoDBPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (options && options.operation === 'db') {
    return <DBStats instance={instance} title={title} description={description} />;
  }

  if (options && options.operation === 'collections') {
    return <Collections instance={instance} title={title} description={description} />;
  }

  if (options && options.operation === 'count' && options.collectionName && options.filter) {
    return (
      <OperationCount
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        filter={options.filter}
        showActions={true}
        times={times}
      />
    );
  }

  if (
    options &&
    options.operation === 'find' &&
    options.collectionName &&
    options.filter &&
    options.sort &&
    options.limit
  ) {
    return (
      <OperationFind
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        filter={options.filter}
        sort={options.sort}
        limit={options.limit}
        showActions={true}
        times={times}
      />
    );
  }

  if (options && options.operation === 'findOne' && options.collectionName && options.filter) {
    return (
      <OperationFindOne
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        filter={options.filter}
        showActions={true}
        times={times}
      />
    );
  }

  if (options && options.operation === 'aggregate' && options.collectionName && options.pipeline) {
    return (
      <OperationAggregate
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        pipeline={options.pipeline}
        showActions={true}
        times={times}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for MongoDB plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/mongodb"
    />
  );
};

export default MongoDBPanel;
