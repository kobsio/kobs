import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import FeedItem from './FeedItem';
import { IItem } from '../../utils/interfaces';

interface IFeedProps {
  urls: string[];
  sortBy: string;
  setDetails?: (details: React.ReactNode) => void;
}

const Alerts: React.FunctionComponent<IFeedProps> = ({ urls, sortBy, setDetails }: IFeedProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IItem[], Error>(
    ['rss/feed', urls, sortBy],
    async () => {
      try {
        const urlParams = urls.map((url) => `&url=${url}`).join('');

        const response = await fetch(`/api/plugins/rss/feed?sortBy=${sortBy}${urlParams}`, {
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

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>
          <FeedItem item={item} setDetails={setDetails} />
          {index !== data.length - 1 ? <p>&nbsp;</p> : null}
        </div>
      ))}
    </div>
  );
};

export default Alerts;
