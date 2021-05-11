import {
  Alert,
  AlertVariant,
  Badge,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { Node } from 'proto/kiali_grpc_web_pb';
import { getTitle } from 'plugins/kiali/helpers';

interface IKialiDetailsNodeProps {
  name: string;
  duration: number;
  node: Node.AsObject;
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

      <DrawerPanelBody>
        <Alert variant={AlertVariant.info} title="Node metrics are not implemented yet" />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default KialiDetailsNode;
