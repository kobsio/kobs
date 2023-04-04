import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { Collections } from './Collections';
import { DBStats } from './DBStats';
import { OperationAggregate } from './OperationAggregate';
import { OperationCount } from './OperationCount';
import { OperationFind } from './OperationFind';
import { OperationFindOne } from './OperationFindOne';

interface IOptions {
  operation?: string;
  query?: IQuery;
}

interface IQuery {
  collectionName?: string;
  filter?: string;
  limit?: number;
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

  if (
    options &&
    options.operation === 'count' &&
    options.query &&
    options.query.collectionName &&
    options.query.filter
  ) {
    return (
      <OperationCount
        instance={instance}
        title={title}
        description={description}
        collectionName={options.query.collectionName}
        filter={options.query.filter}
        showActions={true}
        times={times}
      />
    );
  }

  if (
    options &&
    options.operation === 'find' &&
    options.query &&
    options.query.collectionName &&
    options.query.filter &&
    options.query.sort &&
    options.query.limit
  ) {
    return (
      <OperationFind
        instance={instance}
        title={title}
        description={description}
        collectionName={options.query.collectionName}
        filter={options.query.filter}
        sort={options.query.sort}
        limit={options.query.limit}
        showActions={true}
        times={times}
      />
    );
  }

  if (
    options &&
    options.operation === 'findOne' &&
    options.query &&
    options.query.collectionName &&
    options.query.filter
  ) {
    return (
      <OperationFindOne
        instance={instance}
        title={title}
        description={description}
        collectionName={options.query.collectionName}
        filter={options.query.filter}
        showActions={true}
        times={times}
      />
    );
  }

  if (
    options &&
    options.operation === 'aggregate' &&
    options.query &&
    options.query.collectionName &&
    options.query.pipeline
  ) {
    return (
      <OperationAggregate
        instance={instance}
        title={title}
        description={description}
        collectionName={options.query.collectionName}
        pipeline={options.query.pipeline}
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
      example={`plugin:
  name: mongodb
  type: mongodb
  options:
    # The type must be
    #   - "db" to show the database statistics
    #   - "collections" to show the database collections and collection statistics
    #   - "count" to show the number of documents in a collection for provided filter
    #   - "find" to show the documents in a collection for provided filter, sort and limit
    #   - "findOne" to show a single document in a collection for the provided filter
    type: find
    query:
      collectionName: applications
      filter: '{"namespace": "default"}'
      sort: '{"name": -1}'
      limit: 10`}
      documentation="https://kobs.io/main/plugins/mongodb"
    />
  );
};

export default MongoDBPanel;
