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
    setOptions(getInitialOptions(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageHeaderSection
        title="Applications"
        description="A list of your / all applications. You can search for applications or filter them by clusters, namespaces or tags. It is also possible to include or exclude external applications or only view them."
      />

      <PageContentSection
        hasPadding={true}
        toolbarContent={options ? <ApplicationsToolbar options={options} setOptions={changeOptions} /> : undefined}
        panelContent={undefined}
      >
        {options ? <ApplicationsTopology options={options} /> : <div></div>}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Applications;
