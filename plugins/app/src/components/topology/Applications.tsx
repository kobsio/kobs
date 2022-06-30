import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import ApplicationsToolbar from '../applications/ApplicationsToolbar';
import ApplicationsTopology from './ApplicationsTopology';
import { IOptions } from '../applications/utils/interfaces';
import { getInitialOptions } from '../applications/utils/helpers';

const Applications: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const changeOptions = (opts: IOptions): void => {
    const c = opts.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
    const n = opts.namespaces.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`);
    const t = opts.tags.map((tag) => `&tag=${encodeURIComponent(tag)}`);

    navigate(
      `${location.pathname}?all=${opts.all}&external=${opts.external}&searchTerm=${encodeURIComponent(
        opts.searchTerm,
      )}&page=${opts.page}&perPage=${opts.perPage}${c.length > 0 ? c.join('') : ''}${n.length > 0 ? n.join('') : ''}${
        t.length > 0 ? t.join('') : ''
      }`,
    );
  };

  useEffect(() => {
    setDetails(undefined);
    setOptions(getInitialOptions(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageHeaderSection
        title="Topology"
        description="A topology graph of your / all applications. You can filter the graph by clusters, namespaces or tags. It is also possible to include or exclude external applications or only view them."
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={options ? <ApplicationsToolbar options={options} setOptions={changeOptions} /> : undefined}
        panelContent={details}
      >
        {options && options.clusterIDs.length > 0 ? (
          <ApplicationsTopology options={options} setDetails={setDetails} />
        ) : (
          <Alert variant={AlertVariant.info} isInline={false} title="Options required">
            <p>Select at least one cluster in the toolbar above to render the topology chart.</p>
          </Alert>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Applications;
