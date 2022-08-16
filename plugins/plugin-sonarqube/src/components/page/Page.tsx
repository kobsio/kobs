import {
  Accordion,
  Alert,
  AlertActionLink,
  AlertVariant,
  PageSection,
  PageSectionVariants,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IOptions, IResponseProjects } from '../../utils/interfaces';
import { IPluginPageProps, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import PageItem from './PageItem';
import PageToolbar from './PageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ instance }: IPluginPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IOptions>();

  // changeOptions is used to change the options to get a list of projects from SonarQube. Instead of directly
  // modifying the options state we change the URL parameters.
  const changeOptions = (opts: IOptions): void => {
    navigate(`${location.pathname}?query=${encodeURIComponent(opts.query)}`);
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjects, Error>(
    ['sonarqube/projects', instance, options?.page, options?.query],
    async () => {
      try {
        if (!options) {
          return null;
        }

        const response = await fetch(
          `/api/plugins/sonarqube/projects?query=${encodeURIComponent(options.query)}&pageNumber=${
            options.page
          }&pageSize=${options.perPage}`,
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

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
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
            title="Could not get projects"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IResponseProjects, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data.components && data.components.length > 0 ? (
          <Accordion asDefinitionList={false}>
            {data.components.map((project) => (
              <PageItem key={project.key} instance={instance} project={project} />
            ))}
          </Accordion>
        ) : (
          <div></div>
        )}
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          itemCount={data && data.paging ? data.paging.total : 0}
          perPage={options.perPage}
          page={options.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            setOptions({ ...options, page: 1, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setOptions({ ...options, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default Page;
