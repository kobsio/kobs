import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import Collections from './Collections';
import Count from './Count';
import DBStats from './DBStats';
import Find from './Find';
import { IPanelOptions } from '../../utils/interfaces';

interface IMongoDBPluginPanelProps extends IPluginPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IMongoDBPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
}: IMongoDBPluginPanelProps) => {
  if (options && options.operation && options.operation === 'dbstats') {
    return <DBStats instance={instance} title={title} description={description} />;
  }

  if (options && options.operation && options.operation === 'collections') {
    return <Collections instance={instance} title={title} description={description} />;
  }

  if (options && options.operation && options.operation === 'find' && options.collectionName) {
    return (
      <Find
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        query={options.query ?? '{}'}
        limit={options.limit ?? '50'}
        sort={options.sort ?? '{"_id" : -1}'}
      />
    );
  }

  if (options && options.operation && options.operation === 'count' && options.collectionName) {
    return (
      <Count
        instance={instance}
        title={title}
        description={description}
        collectionName={options.collectionName}
        query={options.query ?? '{}'}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for MongoDB panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from MongoDB."
      documentation="https://kobs.io/main/plugins/mongodb"
    />
  );
};

export default Panel;
