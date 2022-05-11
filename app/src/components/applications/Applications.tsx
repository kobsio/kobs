import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import ApplicationsList from './ApplicationsList';
import ApplicationsPagination from './ApplicationsPagination';
import ApplicationsPanel from './ApplicationsPanel';
import ApplicationsToolbar from './ApplicationsToolbar';
import { IApplication } from '../../crds/application';
import { IOptions } from './utils/interfaces';
import { getInitialOptions } from './utils/helpers';

const Applications: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IOptions>();
  const [selectedApplication, setSelectedApplication] = useState<IApplication>();

  const changeOptions = (opts: IOptions): void => {
    const c = opts.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
    const n = opts.namespaceIDs.map((namespaceID) => `&namespaceID=${encodeURIComponent(namespaceID)}`);
    const t = opts.tags.map((tag) => `&tag=${encodeURIComponent(tag)}`);

    navigate(
      `${location.pathname}?all=${opts.all}&external=${opts.external}&searchTerm=${encodeURIComponent(
        opts.searchTerm,
      )}&page=${opts.page}&=perPage=${opts.perPage}${c.length > 0 ? c.join('') : ''}${n.length > 0 ? n.join('') : ''}${
        t.length > 0 ? t.join('') : ''
      }`,
    );
  };

  useEffect(() => {
    setSelectedApplication(undefined);
    setOptions(getInitialOptions(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageHeaderSection title="Applications" description="A list of your / all applications." />

      <PageContentSection
        toolbarContent={options ? <ApplicationsToolbar options={options} setOptions={changeOptions} /> : undefined}
        panelContent={
          selectedApplication ? (
            <ApplicationsPanel
              application={selectedApplication}
              close={(): void => setSelectedApplication(undefined)}
            />
          ) : undefined
        }
      >
        {options ? (
          <ApplicationsList
            options={options}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
          />
        ) : (
          <div></div>
        )}
      </PageContentSection>

      {options && <ApplicationsPagination options={options} setOptions={changeOptions} />}
    </React.Fragment>
  );
};

export default Applications;
