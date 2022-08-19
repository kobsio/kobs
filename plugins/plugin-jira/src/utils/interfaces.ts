import { IPluginNotificationsProps, ITimes } from '@kobsio/shared';

export interface IOptions {
  jql: string;
  page: number;
  perPage: number;
  times: ITimes;
}

export interface IPanelOptions {
  jql?: string;
}

export interface INotificationProps extends IPluginNotificationsProps {
  options: {
    jql: string;
  };
}
