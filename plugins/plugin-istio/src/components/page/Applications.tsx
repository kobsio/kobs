import { Alert, AlertActionLink, AlertVariant, Card, CardBody } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInitialApplicationsOptions } from '../../utils/helpers';

import {
  IPluginInstance,
  PageContentSection,
  PageHeaderSection,
  PluginPageTitle,
  pluginBasePath,
} from '@kobsio/shared';
import ApplicationsToolbar from './ApplicationsToolbar';
import { IApplicationsOptions } from '../../utils/interfaces';
import { IRowValues } from '../../utils/prometheus/interfaces';
import MetricsTable from '../panel/MetricsTable';
import { defaultDescription } from '@kobsio/plugin-opsgenie/src/utils/constants';

export interface IApplicationsProps {
  instance: IPluginInstance;
}

const Applications: React.FunctionComponent<IApplicationsProps> = ({ instance }: IApplicationsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IApplicationsOptions>();

  const changeOptions = (opts: IApplicationsOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((namespace) => `&namespace=${namespace}`) : [];

    navigate({
      pathname: location.pathname,
      search: `?time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}${
        namespaces.length > 0 ? namespaces.join('') : ''
      }`,
    });
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialApplicationsOptions(location.search, !prevOptions));
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
        toolbarContent={<ApplicationsToolbar instance={instance} options={options} setOptions={changeOptions} />}
        panelContent={undefined}
      >
        {!instance.options?.prometheus ? (
          <Alert
            variant={AlertVariant.warning}
            isInline={true}
            title="Prometheus plugin is not enabled"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>You have to enable the Prometheus integration in the Istio plugin configuration.</p>
          </Alert>
        ) : options.namespaces.length > 0 ? (
          <Card isCompact={true}>
            <CardBody>
              <MetricsTable
                instance={instance}
                namespaces={options.namespaces}
                groupBy="destination_workload_namespace, destination_app"
                label="destination_app"
                reporter="destination"
                times={options.times}
                goTo={(row: IRowValues): void =>
                  navigate({
                    pathname: `${pluginBasePath(instance)}/${row['destination_workload_namespace']}/${
                      row['destination_app']
                    }`,
                  })
                }
              />
            </CardBody>
          </Card>
        ) : (
          <div />
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Applications;
