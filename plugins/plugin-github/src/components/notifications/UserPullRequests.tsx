import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-query';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { INotificationProps, TUserPullRequests } from '../../utils/interfaces';
import UserPullRequest from './UserPullRequest';

const UserPullRequests: React.FunctionComponent<INotificationProps> = ({
  title,
  options,
  instance,
}: INotificationProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data } = useQuery<TUserPullRequests, Error>(
    ['github/users/pullrequests', authContext.organization, options, instance],
    async () => {
      try {
        let query = '';
        if (options.userpullrequests.query === 'created') {
          query = 'is:pull-request author:';
        } else if (options.userpullrequests.query === 'assigned') {
          query = 'is:pull-request assignee:';
        } else if (options.userpullrequests.query === 'mentioned') {
          query = 'is:pull-request mentions:';
        } else if (options.userpullrequests.query === 'reviewRequests') {
          query = 'is:pull-request review-requested:';
        } else {
          throw new Error('invalid query');
        }

        const octokit = authContext.getOctokitClient();
        const pullRequests = await octokit.search.issuesAndPullRequests({
          order: 'desc',
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          q: query + authContext.username,
          sort: 'updated',
        });
        return pullRequests.data;
      } catch (err) {
        throw err;
      }
    },
  );

  if (!data || data.items.length === 0) {
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
      count={data.items.length}
      onExpand={(): void => setIsExpanded(!isExpanded)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {data.items.map((pr) => (
          <UserPullRequest
            key={pr.id}
            url={pr.html_url}
            title={pr.title}
            updatedAt={pr.updated_at}
            number={pr.number}
            user={pr.user?.login}
            state={pr.state}
            createdAt={pr.created_at}
            closedAt={pr.closed_at}
            mergedAt={pr.pull_request?.merged_at}
          />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default UserPullRequests;
