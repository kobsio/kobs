import {
  Alert,
  AlertActionLink,
  AlertVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import React from 'react';

import FeedList from './FeedList';
import { IItem } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IFeedProps {
  instance: IPluginInstance;
  urls: string[];
  sortBy: string;
  setDetails?: (details: React.ReactNode) => void;
}

const Feed: React.FunctionComponent<IFeedProps> = ({ instance, urls, sortBy, setDetails }: IFeedProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IItem[], Error>(
    ['rss/feed', instance, urls, sortBy],
    async () => {
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
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    <Alert
      variant={AlertVariant.danger}
      title="Could not get feed"
      actionLinks={
        <React.Fragment>
          <AlertActionLink onClick={(): Promise<QueryObserverResult<IItem[], Error>> => refetch()}>
            Retry
          </AlertActionLink>
        </React.Fragment>
      }
    >
      <p>{error?.message}</p>
    </Alert>;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="icon" icon={InfoCircleIcon} />
        <Title headingLevel="h4" size="lg">
          No Feed items found
        </Title>
        <EmptyStateBody>We could not find any any items for the specified feed.</EmptyStateBody>
      </EmptyState>
    );
  }

  return <FeedList items={data} setDetails={setDetails} />;
};

export default Feed;
