import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Artifacts from '../panel/Artifacts';
import PageToolbar from './PageToolbar';

interface IArtifactsParams {
  projectName: string;
  repositoryName: string;
}

interface IArtifactsPageProps {
  name: string;
  address: string;
}

const ArtifactsPage: React.FunctionComponent<IArtifactsPageProps> = ({ name, address }: IArtifactsPageProps) => {
  const params = useParams<IArtifactsParams>();
  const [query, setQuery] = useState<string>('');
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {params.projectName}/{decodeURIComponent(params.repositoryName)}
        </Title>
        <PageToolbar query={query} setQuery={setQuery} />
      </PageSection>

      <Drawer isExpanded={details !== undefined}>
        <DrawerContent panelContent={details}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <Artifacts
                name={name}
                address={address}
                projectName={params.projectName}
                repositoryName={params.repositoryName}
                query={query}
                setDetails={setDetails}
              />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default ArtifactsPage;
