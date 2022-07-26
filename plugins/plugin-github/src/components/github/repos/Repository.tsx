import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import { IPluginInstance, PluginPanel, timeDifference } from '@kobsio/shared';
import { TRepository } from '../../../utils/interfaces';
import { languageColors } from '../../../utils/languagecolors';

interface IRepositoryProps {
  title: string;
  description?: string;
  repo: string;
  instance: IPluginInstance;
}

const Repository: React.FunctionComponent<IRepositoryProps> = ({
  title,
  description,
  repo,
  instance,
}: IRepositoryProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { isError, isLoading, error, data, refetch } = useQuery<TRepository, Error>(
    ['github/repo', authContext.organization, repo, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const repository = await octokit.repos.get({
          owner: authContext.organization,
          repo: repo,
        });
        return repository.data;
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get repository"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TRepository, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>{data.name}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Description</DescriptionListTerm>
            <DescriptionListDescription>{data.description || '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          {data.language && (
            <DescriptionListGroup>
              <DescriptionListTerm>Language</DescriptionListTerm>
              <DescriptionListDescription>
                <span
                  style={{
                    backgroundColor: languageColors[data.language].color
                      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        languageColors[data.language].color!
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
                <span className="pf-u-pl-sm">{data.language}</span>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>Stars</DescriptionListTerm>
            <DescriptionListDescription>{data.stargazers_count || 0}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Forks</DescriptionListTerm>
            <DescriptionListDescription>{data.forks_count || 0}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Open Issues</DescriptionListTerm>
            <DescriptionListDescription>{data.open_issues_count || 0}</DescriptionListDescription>
          </DescriptionListGroup>
          {data.updated_at && (
            <DescriptionListGroup>
              <DescriptionListTerm>Updated</DescriptionListTerm>
              <DescriptionListDescription>{`${timeDifference(
                new Date().getTime(),
                new Date(data.updated_at).getTime(),
                true,
              )} ago`}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default Repository;
