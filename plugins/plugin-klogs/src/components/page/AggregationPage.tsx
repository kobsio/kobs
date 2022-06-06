import { Grid, GridItem } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IPluginInstance, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import Aggregation from './Aggregation';
import AggregationOptions from './AggregationOptions';
// import AggregationPageActions from './AggregationPageActions';
import AggregationToolbar from './AggregationToolbar';
import { IAggregationOptions } from '../../utils/interfaces';
import { defaultDescription } from '../../utils/constants';
import { getInitialAggregationOptions } from '../../utils/helpers';

interface IAggregationPageProps {
  instance: IPluginInstance;
}

const AggregationPage: React.FunctionComponent<IAggregationPageProps> = ({ instance }: IAggregationPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<IAggregationOptions>();
  const [tmpOptions, setTmpOptions] = useState<IAggregationOptions>();

  // changeOptions is used to change the options. Besides setting a new value for the options state we also reflect the
  // options in the current url.
  const changeOptions = (): void => {
    if (tmpOptions) {
      navigate(
        `${location.pathname}?query=${encodeURIComponent(tmpOptions.query)}&time=${tmpOptions.times.time}&timeEnd=${
          tmpOptions.times.timeEnd
        }&timeStart=${tmpOptions.times.timeStart}&chart=${tmpOptions.chart}&aggregation=${encodeURIComponent(
          JSON.stringify(tmpOptions.options),
        )}`,
      );
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
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection
        hasPadding={true}
        toolbarContent={<AggregationToolbar options={tmpOptions} setOptions={setTmpOptions} />}
        panelContent={undefined}
      >
        <Grid hasGutter={true}>
          <GridItem sm={12} md={12} lg={3} xl={4} xl2={3}>
            <AggregationOptions options={tmpOptions} setOptions={setTmpOptions} changeOptions={changeOptions} />
          </GridItem>
          <GridItem sm={12} md={12} lg={9} xl={8} xl2={9}>
            {options.query && options.chart && options.options ? (
              <Aggregation instance={instance} options={options} />
            ) : null}
          </GridItem>
        </Grid>
      </PageContentSection>
    </React.Fragment>
  );
};

export default AggregationPage;
