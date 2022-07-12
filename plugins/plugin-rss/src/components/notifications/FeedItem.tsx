import {
  Dropdown,
  DropdownItem,
  KebabToggle,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, formatTime, pluginBasePath } from '@kobsio/shared';
import { IItem } from '../../utils/interfaces';

interface IFeedItemProps {
  instance: IPluginInstance;
  item: IItem;
}

const FeedItem: React.FunctionComponent<IFeedItemProps> = ({ instance, item }: IFeedItemProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  return (
    <NotificationDrawerListItem variant="info" isRead={false}>
      <NotificationDrawerListItemHeader variant="info" title={item.title || ''}>
        <Dropdown
          className="pf-c-drawer__close"
          toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
          isOpen={showDropdown}
          isPlain={true}
          position="right"
          dropdownItems={[
            <DropdownItem
              key="feed"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              component={(props): React.ReactElement => (
                <Link {...props} to={`${pluginBasePath(instance)}?url=${item.feedLink}`} />
              )}
            >
              Show Feed
            </DropdownItem>,
          ]}
        />
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody timestamp={item.published ? formatTime(item.published) : ''}>
        {item.feedTitle}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default FeedItem;
