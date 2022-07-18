import {
  Badge,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import React from 'react';

import { getPRIcon, getPRSubTitle } from '../../utils/helpers';
import { LinkWrapper } from '@kobsio/shared';

interface IPullRequestProps {
  title: string;
  url: string;
  number: number;
  user: string | undefined;
  state: string;
  draft: boolean | undefined;
  createdAt: string;
  closedAt: string | null;
  mergedAt: string | null | undefined;
  labels: {
    id?: number | undefined;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    node_id?: string | undefined;
    url?: string | undefined;
    name?: string | undefined;
    color?: string | undefined;
    default?: boolean | undefined;
    description?: string | null | undefined;
  }[];
}

const PullRequest: React.FunctionComponent<IPullRequestProps> = ({
  title,
  url,
  number,
  user,
  state,
  draft,
  createdAt,
  closedAt,
  mergedAt,
  labels,
}: IPullRequestProps) => {
  return (
    <LinkWrapper to={url}>
      <DataListItem aria-labelledby={title} style={{ cursor: 'pointer' }}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="main">
                <Flex direction={{ default: 'column' }}>
                  <FlexItem>
                    <p>
                      {getPRIcon(state, draft, mergedAt)}
                      <span className="pf-u-pl-sm">{title}</span>
                    </p>
                    <small>
                      {getPRSubTitle(number, user, state, createdAt, closedAt, mergedAt)}
                      <span className="pf-u-pl-sm">
                        {labels.map((label) =>
                          typeof label === 'string' ? (
                            <Badge key={label} className="pf-u-pl-sm" isRead={true}>
                              {label}
                            </Badge>
                          ) : (
                            <Badge
                              key={label.id}
                              className="pf-u-pl-sm"
                              style={label.color ? { backgroundColor: `#${label.color}` } : undefined}
                            >
                              {label.name}
                            </Badge>
                          ),
                        )}
                      </span>
                    </small>
                  </FlexItem>
                </Flex>
              </DataListCell>,
            ]}
          />
        </DataListItemRow>
      </DataListItem>
    </LinkWrapper>
  );
};

export default PullRequest;
