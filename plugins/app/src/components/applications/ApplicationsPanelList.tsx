import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardFooter,
  DataList,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import ApplicationDetails from './ApplicationDetails';
import ApplicationsListItem from './ApplicationsListItem';
import { IApplication } from '../../crds/application';
import { PluginPanel } from '@kobsio/shared';

export interface IApplicationsPanelListProps {
  title: string;
  description?: string;
  team: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ApplicationsPanelList: React.FunctionComponent<IApplicationsPanelListProps> = ({
  title,
  description,
  team,
  setDetails,
}: IApplicationsPanelListProps) => {
  const [options, setOptions] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const selectApplicationID = (id: string): void => {
    const selectedApplications = data?.applications?.filter((application) => application.id === id);
    if (selectedApplications?.length === 1 && setDetails) {
      setDetails(
        <ApplicationDetails application={selectedApplications[0]} close={(): void => setDetails(undefined)} />,
      );
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<{ count: number; applications: IApplication[] }, Error>(
    ['app/applications/team', team, options.page, options.perPage],
    async () => {
      const response = await fetch(
        `/api/applications/team?team=${team}&limit=${options.perPage}&offset=${(options.page - 1) * options.perPage}`,
        {
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
    { keepPreviousData: true },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      footer={
        <CardFooter>
          <Pagination
            style={{ padding: 0 }}
            itemCount={data && data.count ? data.count : 0}
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
          title="An error occured while applications were fetched"
          actionLinks={
            <React.Fragment>
              <AlertActionLink
                onClick={(): Promise<QueryObserverResult<{ count: number; applications: IApplication[] }, Error>> =>
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
      ) : data && data.applications && data.applications.length > 0 ? (
        <DataList
          aria-label={`applications list ${team}`}
          selectedDataListItemId={undefined}
          onSelectDataListItem={selectApplicationID}
        >
          {data.applications.map((application) => (
            <ApplicationsListItem key={application.id} application={application} />
          ))}
        </DataList>
      ) : null}
    </PluginPanel>
  );
};

export default ApplicationsPanelList;
