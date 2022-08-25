import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IAgent, IAgentsOptions } from '../../utils/interfaces';
import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Agents from '../panel/Agents';
import AgentsPageActions from './AgentsPageActions';
import AgentsPageToolbar from './AgentsPageToolbar';
import { defaultDescription } from '../../utils/constants';
import { getInitialRequestsOptions } from '../../utils/helpers';

interface IAgentsPageProps {
  instance: IPluginInstance;
}

const AgentsPage: React.FunctionComponent<IAgentsPageProps> = ({ instance }: IAgentsPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IAgentsOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IAgent[], Error>(
    ['signalsciences/agents', instance, options],
    async () => {
      if (options) {
        const response = await fetch(
          `/api/plugins/signalsciences/agents?siteName=${encodeURIComponent(options.siteName)}`,
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

  const changeOptions = (opts: IAgentsOptions): void => {
    navigate(
      `${location.pathname}?siteName=${encodeURIComponent(opts.siteName)}&time=${opts.times.time}&timeEnd=${
        opts.times.timeEnd
      }&timeStart=${opts.times.timeStart}`,
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
            actions={<AgentsPageActions instance={instance} />}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={<AgentsPageToolbar instance={instance} options={options} setOptions={changeOptions} />}
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
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IAgent[], Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data && data?.length > 0 ? (
          <Agents agents={data} setDetails={setDetails} />
        ) : (
          <Alert variant={AlertVariant.info} isInline={false} title="No agents found">
            <p>No agents were found for the provided site name.</p>
          </Alert>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default AgentsPage;
