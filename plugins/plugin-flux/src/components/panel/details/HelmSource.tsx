import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { ICrossNamespaceObjectReference } from '../../../utils/interfaces';
import { convertSourceKind } from '../../../utils/helpers';

interface IHelmSourceProps {
  instance: IPluginInstance;
  cluster: string;
  namespace: string;
  source: ICrossNamespaceObjectReference;
}

const HelmSource: React.FunctionComponent<IHelmSourceProps> = ({
  instance,
  cluster,
  namespace,
  source,
}: IHelmSourceProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Source</CardTitle>
      <CardBody>
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Source</DescriptionListTerm>
            <DescriptionListDescription>
              {source ? (
                <Link
                  to={`${pluginBasePath(instance)}?type=${convertSourceKind(
                    source.kind,
                  )}&cluster=${cluster}&namespace=${source.namespace || namespace}&type=${source.kind}`}
                >
                  {source.kind} ({source.namespace || namespace})
                </Link>
              ) : (
                '-'
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Kind</DescriptionListTerm>
            <DescriptionListDescription>{source.kind ? source.kind : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Namespace</DescriptionListTerm>
            <DescriptionListDescription>{source.namespace ? source.namespace : '-'}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default HelmSource;
