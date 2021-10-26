import { Avatar, MenuItem } from '@patternfly/react-core';
import React from 'react';

import { IItem } from '../../utils/interfaces';
import Item from './details/Item';
import { formatTime } from '@kobsio/plugin-core';

interface IFeedItemProps {
  item: IItem;
  setDetails?: (details: React.ReactNode) => void;
}

const FeedItem: React.FunctionComponent<IFeedItemProps> = ({ item, setDetails }: IFeedItemProps) => {
  return (
    <MenuItem
      icon={
        item.feedImage ? (
          <Avatar src={item.feedImage} alt={item.title || ''} style={{ height: '16px', width: '16px' }} />
        ) : undefined
      }
      description={item.published ? `${formatTime(item.published)} - ${item.feedTitle}` : item.feedTitle}
      onClick={
        setDetails ? (): void => setDetails(<Item item={item} close={(): void => setDetails(undefined)} />) : undefined
      }
    >
      {item.title}
    </MenuItem>
  );
};

export default FeedItem;
