import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPluginTimes, LinkWrapper, PluginPreview } from '@kobsio/plugin-core';
import { IApplication } from '../../utils/interfaces';

interface IApplicationsGalleryItemProps {
  times: IPluginTimes;
  application: IApplication;
}

// ApplicationsGalleryItem renders a single application in a Card component. With the title of the application and the
// description of the application. If the user doesn't provide a description, we just show the namespace and cluster of
// the application in the card body.
const ApplicationsGalleryItem: React.FunctionComponent<IApplicationsGalleryItemProps> = ({
  times,
  application,
}: IApplicationsGalleryItemProps) => {
  return (
    <LinkWrapper link={`/applications/${application.cluster}/${application.namespace}/${application.name}`}>
      <Card isHoverable={true}>
        <CardTitle className="pf-u-text-truncate">
          {application.name}
          <br />
          <span className="pf-u-font-size-sm pf-u-color-400">
            {application.namespace} ({application.cluster})
          </span>
        </CardTitle>
        <CardBody style={{ height: '150px', maxHeight: '150px', minHeight: '150px' }}>
          {application.preview ? (
            <div style={{ height: '124px', overflow: 'hidden' }}>
              <PluginPreview
                times={times}
                title={application.preview.title}
                name={application.preview.plugin.name}
                options={application.preview.plugin.options}
              />
            </div>
          ) : application.description ? (
            <div style={{ height: '124px', overflow: 'scroll' }}>{application.description}</div>
          ) : (
            <div style={{ height: '124px', overflow: 'scroll' }}></div>
          )}
        </CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default ApplicationsGalleryItem;
