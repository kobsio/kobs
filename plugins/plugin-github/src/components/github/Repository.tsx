import { DataListCell, DataListItem, DataListItemCells, DataListItemRow, Flex, FlexItem } from '@patternfly/react-core';
import { IssueOpenedIcon, RepoForkedIcon, StarIcon } from '@primer/octicons-react';
import React from 'react';

import { languageColors } from '../../utils/languagecolors';
import { timeDifference } from '@kobsio/shared';

interface IRepositoryProps {
  name: string;
  description: string | null;
  language: string | null | undefined;
  stargazersCount: number | undefined;
  forksCount: number | undefined;
  openIssuesCount: number | undefined;
  updatedAt: string | null | undefined;
}

const Repository: React.FunctionComponent<IRepositoryProps> = ({
  name,
  description,
  language,
  stargazersCount,
  forksCount,
  openIssuesCount,
  updatedAt,
}: IRepositoryProps) => {
  return (
    <DataListItem id={name} aria-labelledby={name}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="main">
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <div className="pf-u-font-weight-bold">{name}</div>
                  <div>{description}</div>
                  <div>
                    {language && (
                      <span className="pf-u-pr-md">
                        <span
                          style={{
                            backgroundColor: languageColors[language].color
                              ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                languageColors[language].color!
                              : '#000000',
                            border: '1px solid rgba(205, 217, 229, 0.2)',
                            borderRadius: '50%',
                            display: 'inline-block',
                            height: '12px',
                            position: 'relative',
                            top: '1px',
                            width: '12px',
                          }}
                        ></span>
                        <span className="pf-u-pl-sm">{language}</span>
                      </span>
                    )}
                    <span className="pf-u-pr-md">
                      <span>
                        <StarIcon size={16} />
                      </span>
                      <span className="pf-u-pl-sm">{stargazersCount || 0}</span>
                    </span>
                    <span className="pf-u-pr-md">
                      <span>
                        <RepoForkedIcon size={16} />
                      </span>
                      <span className="pf-u-pl-sm">{forksCount || 0}</span>
                    </span>
                    <span className="pf-u-pr-md">
                      <span>
                        <IssueOpenedIcon size={16} />
                      </span>
                      <span className="pf-u-pl-sm">{openIssuesCount || 0}</span>
                    </span>
                    {updatedAt && (
                      <span>
                        {`Updated ${timeDifference(new Date().getTime(), new Date(updatedAt).getTime(), true)} ago`}
                      </span>
                    )}
                  </div>
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

export default Repository;
