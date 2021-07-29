import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';
import parse from 'html-react-parser';

import { Title, formatTime } from '@kobsio/plugin-core';
import Actions from './Actions';
import { IItem } from '../../../utils/interfaces';

export interface IItemProps {
  item: IItem;
  close: () => void;
}

const Alert: React.FunctionComponent<IItemProps> = ({ item, close }: IItemProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={item.title || ''}
          subtitle={
            item.published ? `${formatTime(item.published)} - ${item.feedTitle}` : item.feedTitle ? item.feedTitle : ''
          }
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <Actions item={item} />
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        {item.image && <img src={item.image} alt={item.title || ''} />}
        {item.description && <div>{parse(item.description)}</div>}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Alert;
