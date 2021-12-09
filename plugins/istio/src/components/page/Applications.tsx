import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IApplicationsOptions, IPluginOptions } from '../../utils/interfaces';
import ApplicationsToolbar from './ApplicationsToolbar';
import { IRowValues } from '@kobsio/plugin-prometheus';
import MetricsTable from '../panel/MetricsTable';
import { getInitialApplicationsOptions } from '../../utils/helpers';

export interface IApplicationsProps {
  name: string;
  displayName: string;
  description: string;
  pluginOptions: IPluginOptions;
}

const Applications: React.FunctionComponent<IApplicationsProps> = ({
  name,
  displayName,
  description,
  pluginOptions,
}: IApplicationsProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IApplicationsOptions>(
    useMemo<IApplicationsOptions>(() => getInitialApplicationsOptions(), []),
  );

  const changeOptions = (opts: IApplicationsOptions): void => {
    const namespaces = opts.namespaces ? opts.namespaces.map((namespace) => `&namespace=${namespace}`) : [];

    history.push({
      pathname: location.pathname,
      search: `?timeEnd=${opts.times.timeEnd}&timeStart=${opts.times.timeStart}${
        namespaces.length > 0 ? namespaces.join('') : ''
      }`,
    });

    setOptions(opts);
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <ApplicationsToolbar name={name} options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {!pluginOptions.prometheus ? (
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title="Prometheus plugin is not enabled"
                  actionLinks={
                    <React.Fragment>
                      <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                    </React.Fragment>
                  }
                >
                  <p>You have to enable the Prometheus integration in the Istio plugin configuration.</p>
                </Alert>
              ) : options.namespaces.length > 0 ? (
                <Card isCompact={true}>
                  <CardBody>
                    <MetricsTable
                      name={name}
                      namespaces={options.namespaces}
                      groupBy="destination_workload_namespace, destination_app"
                      label="destination_app"
                      reporter="destination"
                      times={options.times}
                      goTo={(row: IRowValues): void =>
                        history.push({
                          pathname: `/${name}/${row['destination_workload_namespace']}/${row['destination_app']}`,
                        })
                      }
                    />
                  </CardBody>
                </Card>
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
