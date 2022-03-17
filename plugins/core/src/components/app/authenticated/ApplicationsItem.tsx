import { Badge, Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IApplication } from '../../../crds/application';
import { IPluginTimes } from '../../../context/PluginsContext';
import { LinkWrapper } from '../../misc/LinkWrapper';
import { PluginPreview } from '../../plugin/PluginPreview';

interface IApplicationsItemProps {
  times: IPluginTimes;
  application: IApplication;
}

const ApplicationsItem: React.FunctionComponent<IApplicationsItemProps> = ({
  times,
  application,
}: IApplicationsItemProps) => {
  return (
    <LinkWrapper link={`/applications/${application.cluster}/${application.namespace}/${application.name}`}>
      <Card isHoverable={true}>
        <CardTitle className="pf-u-text-truncate">
          {application.name}
          <br />
          <span className="pf-u-font-size-sm pf-u-color-400">
            {application.topology?.external ? 'external' : `${application.namespace} (${application.cluster})`}
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
          ) : (
            <div className="kobsio-hide-scrollbar" style={{ height: '124px', overflow: 'auto' }}>
              {application.tags && (
                <p>
                  {application.tags.map((tag) => (
                    <Badge key={tag} className="pf-u-mr-sm">
                      {tag.toLowerCase()}
                    </Badge>
                  ))}
                </p>
              )}
              {application.description && <p>{application.description}</p>}
            </div>
          )}
        </CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default ApplicationsItem;
