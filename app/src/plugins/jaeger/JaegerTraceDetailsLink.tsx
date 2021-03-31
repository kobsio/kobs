import React from 'react';

import DrawerLink from 'components/DrawerLink';

interface IJaegerTraceDetailsLinkProps {
  name: string;
  traceID: string;
}

const JaegerTraceDetailsLink: React.FunctionComponent<IJaegerTraceDetailsLinkProps> = ({
  name,
  traceID,
}: IJaegerTraceDetailsLinkProps) => {
  return <DrawerLink link={`/plugins/${name}/trace/${traceID}`} />;
};

export default JaegerTraceDetailsLink;
