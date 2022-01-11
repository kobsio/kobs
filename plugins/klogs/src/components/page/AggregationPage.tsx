import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Aggregation from './Aggregation';
import AggregationOptions from './AggregationOptions';
import AggregationPageActions from './AggregationPageActions';
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
        <div style={{ position: 'relative' }}>
          <Title headingLevel="h6" size="xl">
            {displayName}
          </Title>
          <AggregationPageActions name={name} />
        </div>
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
