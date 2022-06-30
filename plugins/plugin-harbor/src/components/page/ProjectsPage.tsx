import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IOptions, IProjectsData } from '../../utils/interfaces';
import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import NoData from '../panel/NoData';
import Pagination from '../panel/Pagination';
import ProjectsList from '../panel/ProjectsList';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

export interface IProjectsPageProps {
  instance: IPluginInstance;
}

const ProjectsPage: React.FunctionComponent<IProjectsPageProps> = ({ instance }: IProjectsPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();

  const { isError, isLoading, error, data, refetch } = useQuery<IProjectsData, Error>(
    ['harbor/projects', instance, options],
    async () => {
      if (!options) {
        return null;
      }

      try {
        const response = await fetch(
          `/api/plugins/harbor/projects?page=${options?.page}&pageSize=${options?.perPage}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
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

  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?query=${opts.query}&page=${opts.page}&perPage=${opts.perPage}`);
  };

  useEffect(() => {
    setOptions(getInitialOptions(location.search));
  }, [location.search]);

  if (!options) {
    return null;
  }

  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection hasPadding={true} hasDivider={true} toolbarContent={undefined} panelContent={undefined}>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get projects"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IProjectsData, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.total && data.projects && data.projects.length > 0 ? (
          <ProjectsList instance={instance} projects={data.projects} />
        ) : (
          <Card>
            <NoData title="No projects found" description="We could not found any projects for the selected query" />
          </Card>
        )}
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          count={data && data.total ? data.total : 0}
          options={options}
          setOptions={changeOptions}
          noPadding={false}
        />
      </PageSection>
    </React.Fragment>
  );
};

export default ProjectsPage;
