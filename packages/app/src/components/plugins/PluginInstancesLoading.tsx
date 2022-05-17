import { Card, CardBody, Skeleton } from '@patternfly/react-core';
import React from 'react';

const PluginInstancesLoading: React.FunctionComponent = () => {
  return (
    <Card isHoverable={true} isCompact={true}>
      <CardBody>
        <Skeleton
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          shape="circle"
          width="25%"
          screenreaderText="Loading icon"
        />
        <br />
        <Skeleton
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          width="50%"
          fontSize="md"
          screenreaderText="Loading title"
        />
        <br />
        <Skeleton
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          width="100%"
          fontSize="sm"
          screenreaderText="Loading description"
        />
        <Skeleton
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          width="100%"
          fontSize="sm"
          screenreaderText="Loading description"
        />
        <Skeleton
          style={{ marginLeft: 'auto', marginRight: 'auto' }}
          width="75%"
          fontSize="sm"
          screenreaderText="Loading description"
        />
      </CardBody>
    </Card>
  );
};

export default PluginInstancesLoading;
