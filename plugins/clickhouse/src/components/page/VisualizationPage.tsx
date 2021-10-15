import {
  Divider,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { Link, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { IVisualizationOptions } from '../../utils/interfaces';
import Visualization from './Visualization';
import VisualizationOptions from './VisualizationOptions';
import VisualizationToolbar from './VisualizationToolbar';
import { getVisualizationOptionsFromSearch } from '../../utils/helpers';

interface IVisualizationPageProps {
  name: string;
  displayName: string;
  description: string;
}

const VisualizationPage: React.FunctionComponent<IVisualizationPageProps> = ({
  name,
  displayName,
  description,
}: IVisualizationPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [tmpOptions, setTmpOptions] = useState<IVisualizationOptions>(
    getVisualizationOptionsFromSearch(location.search),
  );
  const [options, setOptions] = useState<IVisualizationOptions>(getVisualizationOptionsFromSearch(location.search));

  // changeOptions is used to change the options for an ClickHouse query. Instead of directly modifying the options
  // state we change the URL parameters.
  const changeOptions = (): void => {
    history.push({
      pathname: location.pathname,
      search: `?query=${tmpOptions.query}&timeEnd=${tmpOptions.times.timeEnd}&timeStart=${tmpOptions.times.timeStart}&chart=${tmpOptions.chart}&limit=${tmpOptions.limit}&groupBy=${tmpOptions.groupBy}&operation=${tmpOptions.operation}&operationField=${tmpOptions.operationField}&order=${tmpOptions.order}`,
    });
  };

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changeOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    setOptions(getVisualizationOptionsFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
          <span className="pf-u-font-size-md pf-u-font-weight-normal" style={{ float: 'right' }}>
            <Flex>
              <FlexItem>
                <Link to={`/${name}`}>Logs</Link>
              </FlexItem>
              <Divider isVertical={true} />
              <FlexItem>
                <a href="https://kobs.io/plugins/clickhouse/" target="_blank" rel="noreferrer">
                  Documentation
                </a>
              </FlexItem>
            </Flex>
          </span>
        </Title>
        <p>{description}</p>
        <VisualizationToolbar options={tmpOptions} setOptions={setTmpOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <Grid hasGutter={true}>
                <GridItem sm={12} md={12} lg={3} xl={4} xl2={3}>
                  <VisualizationOptions options={tmpOptions} setOptions={setTmpOptions} changeOptions={changeOptions} />
                </GridItem>
                <GridItem sm={12} md={12} lg={9} xl={8} xl2={9}>
                  {options.query !== '' && options.operationField !== '' ? (
                    <Visualization name={name} options={options} />
                  ) : null}
                </GridItem>
              </Grid>
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default VisualizationPage;
