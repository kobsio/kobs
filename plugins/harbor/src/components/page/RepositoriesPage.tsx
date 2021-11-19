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

import PageToolbar from './PageToolbar';
import Repositories from '../panel/Repositories';

interface IRepositoriesParams {
  projectName: string;
}

interface IRepositoriesPageProps {
  name: string;
}

const RepositoriesPage: React.FunctionComponent<IRepositoriesPageProps> = ({ name }: IRepositoriesPageProps) => {
  const params = useParams<IRepositoriesParams>();
  const [query, setQuery] = useState<string>('');

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {params.projectName}
        </Title>
        <PageToolbar query={query} setQuery={setQuery} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <Repositories name={name} projectName={params.projectName} query={query} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default RepositoriesPage;
