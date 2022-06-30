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

import { IArtifactsData, IOptions } from '../../utils/interfaces';
import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import ArtifactsList from '../panel/ArtifactsList';
import NoData from '../panel/NoData';
import PageToolbar from './PageToolbar';
import Pagination from '../panel/Pagination';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

interface IArtifactsPageParams extends Record<string, string | undefined> {
  projectName?: string;
  repositoryName?: string;
}

export interface IArtifactsPageProps {
  instance: IPluginInstance;
}

const ArtifactsPage: React.FunctionComponent<IArtifactsPageProps> = ({ instance }: IArtifactsPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<IArtifactsPageParams>();
  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IArtifactsData, Error>(
    ['harbor/artifacts', instance, options, params.projectName, params.repositoryName],
    async () => {
      if (!options || !params.projectName || !params.repositoryName) {
        return null;
      }

      try {
        const response = await fetch(
          `/api/plugins/harbor/artifacts?projectName=${params.projectName}&repositoryName=${params.repositoryName}&query=${options.query}&page=${options.page}&pageSize=${options.perPage}`,
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

  if (!options || !params.projectName || !params.repositoryName) {
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
        hasDivider={true}
        toolbarContent={<PageToolbar options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get artifacts"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IArtifactsData, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.total && data.artifacts && data.artifacts.length > 0 ? (
          <ArtifactsList
            instance={instance}
            projectName={params.projectName}
            repositoryName={params.repositoryName}
            artifacts={data.artifacts}
            setDetails={setDetails}
          />
        ) : (
          <Card>
            <NoData title="No artifacts found" description="We could not found any artifacts for the selected query" />
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

export default ArtifactsPage;
