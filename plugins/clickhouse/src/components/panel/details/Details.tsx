import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import React from 'react';

import { IDocument } from '../../../utils/interfaces';
import { Title } from '@kobsio/plugin-core';
import { formatTimeWrapper } from '../../../utils/helpers';

export interface IDetailsProps {
  document: IDocument;
  close: () => void;
}

const Details: React.FunctionComponent<IDetailsProps> = ({ document, close }: IDetailsProps) => {
  return (
    <DrawerPanelContent minSize="50%">
      <DrawerHead>
        <Title
          title={formatTimeWrapper(document['timestamp'])}
          subtitle={`${document['container_name']}/${document['pod_name']} (${document['namespace']}/${document['cluster']})`}
          size="lg"
        />
        <DrawerActions style={{ padding: 0 }}>
          <DrawerCloseButton onClose={close} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
        <Card>
          <CardBody>
            <DescriptionList className="pf-u-text-break-word">
              {Object.keys(document).map((key) => (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>{document[key]}</DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardBody>
        </Card>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default Details;
