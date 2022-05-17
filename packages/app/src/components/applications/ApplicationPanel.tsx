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

const ApplicationPanel: React.FunctionComponent<IApplicationPanelProps> = ({
  application,
  close,
}: IApplicationPanelProps) => {
  return (
    <DrawerPanelContent>
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {application.name}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {application.topology && application.topology.external === true
              ? ''
              : `(${application.namespace} / ${application.cluster})`}
          </span>
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

export default ApplicationPanel;
