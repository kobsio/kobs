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

import Aggregation from './Aggregation';
import AggregationOptions from './AggregationOptions';
import AggregationToolbar from './AggregationToolbar';
import { IAggregationOptions } from '../../utils/interfaces';
import { getInitialAggregationOptions } from '../../utils/helpers';

interface IAggregationPageProps {
  name: string;
  displayName: string;
  description: string;
}

const AggregationPage: React.FunctionComponent<IAggregationPageProps> = ({
  name,
  displayName,
  description,
}: IAggregationPageProps) => {
  const location = useLocation();
  const history = useHistory();
  const [options, setOptions] = useState<IAggregationOptions>();
  const [tmpOptions, setTmpOptions] = useState<IAggregationOptions>();

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (): void => {
    if (tmpOptions) {
      history.push({
        pathname: location.pathname,
        search: `?query=${encodeURIComponent(tmpOptions.query)}&time=${tmpOptions.times.time}&timeEnd=${
          tmpOptions.times.timeEnd
        }&timeStart=${tmpOptions.times.timeStart}&chart=${tmpOptions.chart}&aggregation=${encodeURIComponent(
          JSON.stringify(tmpOptions.options),
        )}`,
      });
    }
  };

  useEffect(() => {
    setOptions((prevOptions) => getInitialAggregationOptions(location.search, !prevOptions));
    setTmpOptions((prevOptions) =>
      !prevOptions ? getInitialAggregationOptions(location.search, !prevOptions) : prevOptions,
    );
  }, [location.search]);

  if (!options || !tmpOptions) {
    return null;
  }

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
                <a href="https://kobs.io/plugins/klogs/" target="_blank" rel="noreferrer">
                  Documentation
                </a>
              </FlexItem>
            </Flex>
          </span>
        </Title>
        <p>{description}</p>
        <AggregationToolbar options={tmpOptions} setOptions={setTmpOptions} />
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <Grid hasGutter={true}>
                <GridItem sm={12} md={12} lg={3} xl={4} xl2={3}>
                  <AggregationOptions options={tmpOptions} setOptions={setTmpOptions} changeOptions={changeOptions} />
                </GridItem>
                <GridItem sm={12} md={12} lg={9} xl={8} xl2={9}>
                  {options.query && options.chart && options.options ? (
                    <Aggregation name={name} options={options} />
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

export default AggregationPage;
