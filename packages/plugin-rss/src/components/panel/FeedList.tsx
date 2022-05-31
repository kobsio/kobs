import React, { useState } from 'react';
import { DataList } from '@patternfly/react-core';

import FeedListItem from './FeedListItem';
import { IItem } from '../../utils/interfaces';
import Item from './details/Item';

interface IFeedListProps {
  items: IItem[];
  setDetails?: (details: React.ReactNode) => void;
}

const FeedList: React.FunctionComponent<IFeedListProps> = ({ items, setDetails }: IFeedListProps) => {
  const [selectedItem, setSelectedItem] = useState<string>();

  const selectItem = (id: string): void => {
    const index = parseInt(id);

    if (setDetails) {
      setSelectedItem(id);
      setDetails(
        <Item
          item={items[index]}
          close={(): void => {
            setSelectedItem(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  return (
    <DataList aria-label="Feed items list" selectedDataListItemId={selectedItem} onSelectDataListItem={selectItem}>
      {items.map((item, index) => (
        <FeedListItem key={index} id={`${index}`} item={item} />
      ))}
    </DataList>
  );
};

export default FeedList;
