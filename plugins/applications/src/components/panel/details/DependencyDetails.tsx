import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { DashboardsWrapper } from '@kobsio/plugin-dashboards';
import { IDashboardReference } from '@kobsio/plugin-core';
import { INode } from '../../../utils/interfaces';

interface IDependencyDetailsProps {
  source?: INode;
  target?: INode;
  description?: string;
  dashboards?: IDashboardReference[];
  close: () => void;
}

const DependencyDetails: React.FunctionComponent<IDependencyDetailsProps> = ({
  source,
  target,
  description,
  dashboards,
  close,
}: IDependencyDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <span>
          <span className="pf-u-font-size-sm pf-u-color-400">From:</span>
          <span className="pf-u-pl-sm pf-c-title pf-m-lg">
            <span className="pf-u-pl-sm">{source?.data.name} </span>
            <span className="pf-u-font-size-sm pf-u-color-400">
              {source?.data.topology?.external ? '(external)' : `(${source?.data.namespace} / ${source?.data.cluster})`}
            </span>
          </span>
          <span className="pf-u-pl-lg pf-u-font-size-sm pf-u-color-400">To:</span>
          <span className="pf-u-pl-sm pf-c-title pf-m-lg">
            <span className="pf-u-pl-sm">{target?.data.name} </span>
            <span className="pf-u-font-size-sm pf-u-color-400">
              {target?.data.topology?.external ? '(external)' : `(${target?.data.namespace} / ${target?.data.cluster})`}
            </span>
          </span>
        </span>
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <div>{description && <p>{description}</p>}</div>

        <p>&nbsp;</p>

        {dashboards ? <DashboardsWrapper cluster="" namespace="" references={dashboards} /> : null}

        <p>&nbsp;</p>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default DependencyDetails;
