import {
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import React from 'react';

import { IItem } from '../../utils/interfaces';
import { formatTime } from '@kobsio/shared';

interface IFeedItemProps {
  id: string;
  item: IItem;
  setDetails?: (details: React.ReactNode) => void;
}

const FeedItem: React.FunctionComponent<IFeedItemProps> = ({ id, item, setDetails }: IFeedItemProps) => {
  return (
    <DataListItem id={id} aria-labelledby={id}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <p>{item.title}</p>
                </FlexItem>
                <small>{item.feedTitle}</small>
              </Flex>
            </DataListCell>,
          ]}
        />
        {item.published && (
          <DataListAction aria-labelledby={id || ''} id={id || ''} aria-label="Created at">
            {formatTime(item.published)}
          </DataListAction>
        )}
      </DataListItemRow>
    </DataListItem>
  );
};

export default FeedItem;
