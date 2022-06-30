import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@patternfly/react-core';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import { IOptions } from './utils/interfaces';
import ResourcesPanel from './ResourcesPanel';
import ResourcesToolbar from './ResourcesToolbar';
import { getInitialOptions } from './utils/helpers';

const Resources: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<IOptions>();
  const [details, setDetails] = useState<React.ReactNode>();

  const changeOptions = (opts: IOptions): void => {
    const c = opts.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
    const n = opts.namespaces.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`);
    const r = opts.resourceIDs.map((resourceID) => `&resourceID=${encodeURIComponent(resourceID)}`);

    navigate(
      `${location.pathname}?time=${opts.times.time}&timeEnd=${opts.times.timeEnd}&timeStart=${
        opts.times.timeStart
      }&param=${encodeURIComponent(opts.param)}&paramName=${opts.paramName}${c.length > 0 ? c.join('') : ''}${
        n.length > 0 ? n.join('') : ''
      }${r.length > 0 ? r.join('') : ''}`,
    );
  };

  useEffect(() => {
    setDetails(undefined);
    setOptions((prevOptions) => getInitialOptions(location.search, !prevOptions));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageHeaderSection
        title="Kubernetes Resources"
        description="View and edit your Kubernetes resources. You can show your Kubernetes resources from different clusters and namespaces. You can also view the resources usage and logs of your Pod or get a shell into a Pod."
      />

      <PageContentSection
        hasPadding={true}
        hasDivider={true}
        toolbarContent={options ? <ResourcesToolbar options={options} setOptions={changeOptions} /> : undefined}
        panelContent={details ? details : undefined}
      >
        {options && options.resourceIDs.length > 0 ? (
          <Card isCompact={true}>
            <ResourcesPanel isInline={false} options={options} setDetails={setDetails} />
          </Card>
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Resources;
