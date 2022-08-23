import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  LogoGithubIcon,
} from '@primer/octicons-react';
import React from 'react';

import { timeDifference } from '@kobsio/shared';

export const getPRIcon = (
  state: string,
  draft: boolean | undefined,
  mergedAt: string | null | undefined,
): React.ReactElement => {
  if (state === 'open') {
    if (draft === true) {
      return <GitPullRequestDraftIcon size={16} fill="#768390" />;
    }

    return <GitPullRequestIcon size={16} fill="#57ab5a" />;
  }

  if (state === 'closed') {
    if (mergedAt) {
      return <GitMergeIcon size={16} fill="#986ee2" />;
    }

    return <GitPullRequestClosedIcon size={16} fill="#e5534b" />;
  }

  return <LogoGithubIcon size={16} fill="#000000" />;
};

export const getPRSubTitle = (
  number: number,
  user: string | undefined,
  state: string,
  createdAt: string,
  closedAt: string | null,
  mergedAt: string | null | undefined,
): string => {
  const formattedUser = user ? `by ${user}` : '';

  if (state === 'open') {
    const openedTime = timeDifference(new Date().getTime(), new Date(createdAt).getTime(), true);
    return `#${number} was opened ${openedTime} ago ${formattedUser}`;
  }

  if (state === 'closed') {
    if (mergedAt) {
      const mergedTime = mergedAt ? timeDifference(new Date().getTime(), new Date(mergedAt).getTime(), true) : '';
      return `#${number} was merged ${mergedTime ? `${mergedTime} ago` : ''} ${formattedUser}`;
    }

    const closedTime = closedAt ? timeDifference(new Date().getTime(), new Date(closedAt).getTime(), true) : '';
    return `#${number} was closed ${closedTime ? `${closedTime} ago` : ''} ${formattedUser}`;
  }

  return '';
};