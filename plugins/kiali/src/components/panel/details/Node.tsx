import {
  Badge,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { INodeData } from '../../../utils/interfaces';
import { getTitle } from '../../../utils/helpers';

interface IKialiDetailsNodeProps {
  name: string;
  duration: number;
  node: INodeData;
  close: () => void;
}

const KialiDetailsNode: React.FunctionComponent<IKialiDetailsNodeProps> = ({
  name,
  duration,
  node,
  close,
}: IKialiDetailsNodeProps) => {
  const title = getTitle(node);

  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <span>
          <span className="pf-c-title pf-m-lg">
            <Badge isRead={false}>{title.badge}</Badge>
            <span className="pf-u-pl-sm">{title.title}</span>
          </span>
        </span>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody></DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default KialiDetailsNode;
