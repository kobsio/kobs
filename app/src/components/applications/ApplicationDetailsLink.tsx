import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Application } from 'proto/application_pb';
import DrawerLink from 'components/DrawerLink';

interface IApplicationDetailsLinkProps {
  application: Application.AsObject;
}

// ApplicationDetailsLink renders the link to the details page for an application inside the DrawerPanel of the
// applications page. Everytime when the location.search parameter (query parameters) are changing, we are adding the
// new parameters to the link, so that for example a change of the selected time range is also used in the details page.
const ApplicationDetailsLink: React.FunctionComponent<IApplicationDetailsLinkProps> = ({
  application,
}: IApplicationDetailsLinkProps) => {
  const location = useLocation();

  const [link, setLink] = useState<string>(
    `/applications/${application.cluster}/${application.namespace}/${application.name}`,
  );

  useEffect(() => {
    setLink(`/applications/${application.cluster}/${application.namespace}/${application.name}${location.search}`);
  }, [application, location.search]);

  return <DrawerLink link={link} />;
};

export default ApplicationDetailsLink;
