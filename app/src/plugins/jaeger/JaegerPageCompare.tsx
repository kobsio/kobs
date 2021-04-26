import { Grid, GridItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { CloseIcon } from '@patternfly/react-icons';

import JaegerPageCompareInput from 'plugins/jaeger/JaegerPageCompareInput';
import JaegerPageCompareTrace from 'plugins/jaeger/JaegerPageCompareTrace';

interface IJaegerPageCompareParams {
  traceID?: string;
}

interface IJaegerPageCompareProps {
  name: string;
}

// JaegerPageCompare is the component, which renders two traces for comparison.
const JaegerPageCompare: React.FunctionComponent<IJaegerPageCompareProps> = ({ name }: IJaegerPageCompareProps) => {
  const params = useParams<IJaegerPageCompareParams>();
  const history = useHistory();
  const location = useLocation();
  const [compareTrace, setCompareTrace] = useState<string>('');

  // changeCompareTrace is used to set the trace id. If no trace id is provided as parameter, it sets the traceID
  // parameter. If a trace id is provided it sets the trace id as compare paramter to compare the two traces.
  const changeCompareTrace = (traceID: string): void => {
    if (params.traceID) {
      history.push({
        pathname: location.pathname,
        search: `?compare=${traceID}`,
      });
    } else {
      history.push({
        pathname:
          location.pathname.slice(-1) === '/' ? `${location.pathname}${traceID}` : `${location.pathname}/${traceID}`,
      });
    }
  };

  // useEffect is used to set the options every time the search location for the current URL changes. The URL is changed
  // via the changeOptions function. When the search location is changed we modify the options state.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const traceID = params.get('compare');
    setCompareTrace(traceID ? traceID : '');
  }, [location.search]);

  if (!params.traceID) {
    return (
      <Grid>
        <GridItem sm={12} md={12} lg={compareTrace ? 6 : 12} xl={compareTrace ? 6 : 12} xl2={compareTrace ? 6 : 12}>
          <PageSection style={{ height: '100%' }} variant={PageSectionVariants.light}>
            <JaegerPageCompareInput changeCompareTrace={changeCompareTrace} />
          </PageSection>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid>
      <GridItem sm={12} md={12} lg={compareTrace ? 6 : 12} xl={compareTrace ? 6 : 12} xl2={compareTrace ? 6 : 12}>
        <JaegerPageCompareTrace
          name={name}
          traceID={params.traceID}
          headerComponent={!compareTrace ? <JaegerPageCompareInput changeCompareTrace={changeCompareTrace} /> : null}
        />
      </GridItem>

      {compareTrace ? (
        <GridItem sm={12} md={12} lg={compareTrace ? 6 : 12} xl={compareTrace ? 6 : 12} xl2={compareTrace ? 6 : 12}>
          <JaegerPageCompareTrace
            name={name}
            traceID={compareTrace}
            headerComponent={
              <CloseIcon style={{ cursor: 'pointer', float: 'right' }} onClick={(): void => changeCompareTrace('')} />
            }
          />
        </GridItem>
      ) : null}
    </Grid>
  );
};

export default JaegerPageCompare;
