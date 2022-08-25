import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardFooter,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IRequest } from '../../utils/interfaces';
import Requests from '../panel/Requests';
import RequestsPanelActions from './RequestsPanelActions';

interface IRequestsPanelProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  siteName: string;
  query: string;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const RequestsPanel: React.FunctionComponent<IRequestsPanelProps> = ({
  title,
  description,
  instance,
  siteName,
  query,
  times,
  setDetails,
}: IRequestsPanelProps) => {
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 50 });

  const { isError, isLoading, error, data, refetch } = useQuery<{ requests: IRequest[]; total: number }, Error>(
    ['signalsciences/requests', instance, query, times],
    async () => {
      const response = await fetch(
        `/api/plugins/signalsciences/requests?query=${encodeURIComponent(
          `${query} from:${times.timeStart} until:${times.timeEnd}` || `from:${times.timeStart} until:${times.timeEnd}`,
        )}&siteName=${encodeURIComponent(siteName)}&page=0&limit=1000`,
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
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<RequestsPanelActions instance={instance} query={query} siteName={siteName} times={times} />}
      footer={
        <CardFooter>
          <Pagination
            style={{ padding: 0 }}
            isCompact={true}
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
        </CardFooter>
      }
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get requests"
          actionLinks={
            <React.Fragment>
              <AlertActionLink
                onClick={(): Promise<QueryObserverResult<{ requests: IRequest[]; total: number }, Error>> => refetch()}
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
    </PluginPanel>
  );
};

export default RequestsPanel;
