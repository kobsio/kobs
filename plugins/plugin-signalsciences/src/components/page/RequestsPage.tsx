import {
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

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { IRequest, IRequestsOptions } from '../../utils/interfaces';
import Requests from '../panel/Requests';
import RequestsPageActions from './RequestsPageActions';
import RequestsPageToolbar from './RequestsPageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialRequestsOptions } from '../../utils/helpers';

interface IRequestsPageProps {
  instance: IPluginInstance;
}

const RequestsPage: React.FunctionComponent<IRequestsPageProps> = ({ instance }: IRequestsPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IRequestsOptions>();
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 50 });
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<{ requests: IRequest[]; total: number }, Error>(
    ['signalsciences/requests', instance, options],
    async () => {
      if (options) {
        const response = await fetch(
          `/api/plugins/signalsciences/requests?query=${encodeURIComponent(
            `${options.query} from:${options.times.timeStart} until:${options.times.timeEnd}` ||
              `from:${options.times.timeStart} until:${options.times.timeEnd}`,
          )}&siteName=${encodeURIComponent(options.siteName)}&page=${options.page - 1}&limit=${options.perPage}`,
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
      }
    },
  );

  const changeOptions = (opts: IRequestsOptions): void => {
    navigate(
      `${location.pathname}?query=${encodeURIComponent(opts.query)}&siteName=${encodeURIComponent(
        opts.siteName,
      )}&page=${opts.page}&perPage=${opts.perPage}&time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${
        opts.times.timeStart
      }`,
    );
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialRequestsOptions(location.search, !prevOptions));
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
            actions={<RequestsPageActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<RequestsPageToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={details}
      >
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={false}
            title="Could not get requests"
            actionLinks={
              <React.Fragment>
                <AlertActionLink
                  onClick={(): Promise<QueryObserverResult<{ requests: IRequest[]; total: number }, Error>> =>
                    refetch()
                  }
                >
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data?.requests?.length > 0 ? (
          <Requests requests={data.requests} page={page.page} perPage={page.perPage} setDetails={setDetails} />
        ) : (
          <Alert variant={AlertVariant.info} isInline={false} title="No requests found">
            <p>No requests were found for the provided query.</p>
          </Alert>
        )}
      </PageContentSection>

      <PageSection
        isFilled={false}
        sticky="bottom"
        padding={{ default: 'noPadding' }}
        variant={PageSectionVariants.light}
      >
        <Pagination
          itemCount={data?.total || 0}
          perPage={page.perPage}
          page={page.page}
          variant={PaginationVariant.bottom}
          onSetPage={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number): void =>
            setPage({ ...page, page: newPage })
          }
          onPerPageSelect={(event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number): void =>
            setPage({ ...page, page: 1, perPage: newPerPage })
          }
          onFirstClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setPage({ ...page, page: newPage })
          }
          onLastClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setPage({ ...page, page: newPage })
          }
          onNextClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setPage({ ...page, page: newPage })
          }
          onPreviousClick={(event: React.SyntheticEvent<HTMLButtonElement>, newPage: number): void =>
            setPage({ ...page, page: newPage })
          }
        />
      </PageSection>
    </React.Fragment>
  );
};

export default RequestsPage;
