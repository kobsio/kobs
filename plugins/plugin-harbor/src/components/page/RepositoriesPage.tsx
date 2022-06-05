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
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { IOptions, IRepositoriesData } from '../../utils/interfaces';
import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import NoData from '../panel/NoData';
import PageToolbar from './PageToolbar';
import Pagination from '../panel/Pagination';
import RepositoriesList from '../panel/RepositoriesList';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

interface IRepositoriesPageParams extends Record<string, string | undefined> {
  projectName?: string;
}

export interface IRepositoriesPageProps {
  instance: IPluginInstance;
}

const RepositoriesPage: React.FunctionComponent<IRepositoriesPageProps> = ({ instance }: IRepositoriesPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<IRepositoriesPageParams>();
  const [options, setOptions] = useState<IOptions>();

  const { isError, isLoading, error, data, refetch } = useQuery<IRepositoriesData, Error>(
    ['harbor/repositories', instance, options, params.projectName],
    async () => {
      if (!options || !params.projectName) {
        return null;
      }

      try {
        const response = await fetch(
          `/api/plugins/harbor/repositories?projectName=${params.projectName}&query=${options.query}&page=${options.page}&pageSize=${options.perPage}`,
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

  if (!options || !params.projectName) {
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

      <PageContentSection
        hasPadding={true}
        toolbarContent={<PageToolbar options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get repositories"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IRepositoriesData, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.total && data.repositories && data.repositories.length > 0 ? (
          <RepositoriesList instance={instance} projectName={params.projectName} repositories={data.repositories} />
        ) : (
          <Card>
            <NoData
              title="No repositories found"
              description="We could not found any repositories for the selected query"
            />
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

export default RepositoriesPage;
