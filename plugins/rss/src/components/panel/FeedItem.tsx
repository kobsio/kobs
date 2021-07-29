import { Avatar, Card, CardBody, Split, SplitItem } from '@patternfly/react-core';
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
    <Card
      style={{ cursor: 'pointer' }}
      isCompact={true}
      isHoverable={true}
      onClick={
        setDetails ? (): void => setDetails(<Item item={item} close={(): void => setDetails(undefined)} />) : undefined
      }
    >
      <CardBody>
        <Split>
          {item.feedImage && (
            <SplitItem>
              <Avatar src={item.feedImage} alt={item.title || ''} style={{ height: '42px', width: '42px' }} />
            </SplitItem>
          )}
          <SplitItem className="pf-u-pl-md" style={{ maxWidth: '100%' }} isFilled={true}>
            <p className="pf-u-text-truncate">
              <strong>{item.title}</strong>
            </p>
            <p className="pf-u-text-truncate pf-u-font-size-sm pf-u-color-400">
              {item.published ? `${formatTime(item.published)} - ${item.feedTitle}` : item.feedTitle}
            </p>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  );
};

export default FeedItem;
