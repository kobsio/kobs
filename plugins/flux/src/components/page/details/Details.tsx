import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { IRow } from '@patternfly/react-table';
import React from 'react';

import { IResource, Title } from '@kobsio/plugin-core';

interface IDetailsProps {
  request: IResource;
  resource: IRow;
  close: () => void;
  refetch: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ request, resource, close, refetch }: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={resource.name.title}
          subtitle={
            resource.namespace ? `${resource.namespace.title} (${resource.cluster.title})` : resource.cluster.title
          }
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody></DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
