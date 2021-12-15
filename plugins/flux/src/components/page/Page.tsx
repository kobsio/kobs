import {
  Alert,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageList from './PageList';
import PageToolbar from './PageToolbar';
import { getInitialOptions } from '../../utils/helpers';

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const [options, setOptions] = useState<IOptions>(useMemo<IOptions>(() => getInitialOptions(), []));
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const changeOptions = (opts: IOptions): void => {
    history.push({
      pathname: location.pathname,
      search: `?type=${opts.type}&cluster=${opts.cluster}`,
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
        <PageToolbar options={options} setOptions={changeOptions} />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {!options || !options.cluster ? (
                <Alert variant={AlertVariant.info} title="Select a cluster and type">
                  <p>Select a cluster and type from the toolbar.</p>
                </Alert>
              ) : (
                <React.Fragment>
                  {options.type === 'sources' ? (
                    <React.Fragment>
                      <PageList
                        name={name}
                        cluster={options.cluster}
                        type="gitrepositories.source.toolkit.fluxcd.io/v1beta1"
                        title="Git Repos"
                        times={options.times}
                        showDetails={setDetails}
                      />
                      <p>&nbsp;</p>
                      <PageList
                        name={name}
                        cluster={options.cluster}
                        type="helmrepositories.source.toolkit.fluxcd.io/v1beta1"
                        title="Helm Repos"
                        times={options.times}
                        showDetails={setDetails}
                      />
                      <p>&nbsp;</p>
                      <PageList
                        name={name}
                        cluster={options.cluster}
                        type="buckets.source.toolkit.fluxcd.io/v1beta1"
                        title="Buckets"
                        times={options.times}
                        showDetails={setDetails}
                      />
                    </React.Fragment>
                  ) : options.type === 'kustomizations' ? (
                    <PageList
                      name={name}
                      cluster={options.cluster}
                      type="kustomizations.kustomize.toolkit.fluxcd.io/v1beta1"
                      title="Kustomizations"
                      times={options.times}
                      showDetails={setDetails}
                    />
                  ) : options.type === 'helmreleases' ? (
                    <PageList
                      name={name}
                      cluster={options.cluster}
                      type="helmreleases.helm.toolkit.fluxcd.io/v2beta1"
                      title="Helm Releases"
                      times={options.times}
                      showDetails={setDetails}
                    />
                  ) : null}
                </React.Fragment>
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
