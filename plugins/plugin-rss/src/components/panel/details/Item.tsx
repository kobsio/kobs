import {
  Card,
  CardBody,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import parse from 'html-react-parser';

import Actions from './Actions';
import { IItem } from '../../../utils/interfaces';
import { formatTime } from '@kobsio/shared';

export interface IItemProps {
  item: IItem;
  close: () => void;
}

const Item: React.FunctionComponent<IItemProps> = ({ item, close }: IItemProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {item.title || ''}
          <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
            {item.published
              ? `${formatTime(item.published)} - ${item.feedTitle}`
              : item.feedTitle
              ? item.feedTitle
              : ''}
          </span>
        </Title>
        <DrawerActions style={{ padding: 0 }}>
          <Actions item={item} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {item.image && (
          <Card isCompact={true}>
            <CardBody>
              <img src={item.image} alt={item.title || ''} />
            </CardBody>
          </Card>
        )}
        {item.description ? (
          <Card isCompact={true}>
            <CardBody>{parse(item.description)}</CardBody>
          </Card>
        ) : item.content ? (
          <Card isCompact={true}>
            <CardBody>{parse(item.content)}</CardBody>
          </Card>
        ) : null}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Item;
