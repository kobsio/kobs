import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardActions,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Spinner,
  Switch,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { TUserNotifications } from '../../../utils/interfaces';

interface IUserNotificationsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
}

const UserNotifications: React.FunctionComponent<IUserNotificationsProps> = ({
  title,
  description,
  instance,
}: IUserNotificationsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });
  const [all, setAll] = useState<boolean>(false);
  const [participating, setParticipating] = useState<boolean>(false);

  const { isError, isLoading, error, data, refetch } = useQuery<TUserNotifications, Error>(
    ['github/users/notifications', authContext.organization, all, participating, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const notifications = await octokit.activity.listNotificationsForAuthenticatedUser({
          all: all,
          page: 1,
          participating: participating,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
        });
        return notifications.data;
      } catch (err) {
        throw err;
      }
    },
  );

  const selectNotification = async (id: string): Promise<void> => {
    try {
      const notification = data?.filter((notification) => notification.id === id);
      if (notification && notification.length === 1) {
        const octokit = authContext.getOctokitClient();
        const response = await octokit.request(`GET ${notification[0].subject.url}`);

        if (response && response.data && response.data.html_url) {
          window.open(response.data.html_url, '_blank');
        }
      }
    } catch (err) {}
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <span>
            <Switch
              id="all"
              label="All"
              labelOff="All"
              isReversed={true}
              isChecked={all}
              onChange={(isChecked: boolean): void => setAll(isChecked)}
            />
          </span>
          <span className="pf-u-pl-xl">
            <Switch
              id="participating"
              label="Participating"
              labelOff="Participating"
              isReversed={true}
              isChecked={participating}
              onChange={(isChecked: boolean): void => setParticipating(isChecked)}
            />
          </span>
        </CardActions>
      }
      footer={<GitHubPagination itemCount={data?.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get notifications"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TUserNotifications, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="notifications" isCompact={true} onSelectDataListItem={selectNotification}>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((notification) => (
            <DataListItem
              key={notification.id}
              id={notification.id}
              aria-labelledby={notification.subject.title}
              style={{ cursor: 'pointer' }}
              isExpanded={notification.unread}
            >
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="main">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <p>{notification.subject.title}</p>
                          <small>{notification.repository.full_name}</small>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default UserNotifications;
