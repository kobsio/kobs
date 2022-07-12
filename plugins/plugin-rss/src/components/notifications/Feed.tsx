import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import FeedItem from './FeedItem';
import { IItem } from '../../utils/interfaces';

interface IFeedProps {
  title: string;
  instance: IPluginInstance;
  urls: string[];
  sortBy: string;
  times?: ITimes;
}

const Feed: React.FunctionComponent<IFeedProps> = ({ title, instance, urls, sortBy, times }: IFeedProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data } = useQuery<IItem[], Error>(['rss/feed', instance, urls, sortBy, times], async () => {
    try {
      const urlParams = urls.map((url) => `&url=${url}`).join('');

      const response = await fetch(`/api/plugins/rss/feed?sortBy=${sortBy}${urlParams}`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-plugin': instance.name,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'x-kobs-satellite': instance.satellite,
        },
        method: 'get',
      });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    } catch (err) {
      throw err;
    }
  });

  if (!data || data.length === 0) {
    return (
      <NotificationDrawerGroup title={title} isExpanded={false} count={0}>
        <NotificationDrawerList isHidden={true} />
      </NotificationDrawerGroup>
    );
  }

  return (
    <NotificationDrawerGroup
      title={title}
      isExpanded={isExpanded}
      count={data.length}
      onExpand={(): void => setIsExpanded(!isExpanded)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {data.map((item, index) => (
          <FeedItem key={index} instance={instance} item={item} />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default Feed;
