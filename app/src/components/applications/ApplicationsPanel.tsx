import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { IApplication } from '../../crds/application';

interface IApplicationPanelProps {
  application: IApplication;
  close: () => void;
}

const Applications: React.FunctionComponent<IApplicationPanelProps> = ({
  application,
  close,
}: IApplicationPanelProps) => {
  return (
    <DrawerPanelContent>
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {application.name}{' '}
          {application.topology && application.topology.external === true
            ? ''
            : `(${application.namespace} / ${application.cluster})`}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={close} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Flex spaceItems={{ default: 'spaceItemsLg' }} direction={{ default: 'column' }}>
          <FlexItem>
            <p>{application.description}</p>
          </FlexItem>
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Applications;
