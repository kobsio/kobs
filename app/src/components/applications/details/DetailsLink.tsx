import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Application } from 'generated/proto/application_pb';

interface IDetailsLinkProps {
  application: Application;
}

// DetailsLink renders the link to the details page for an application inside the DrawerPanel of the applications page.
// Everytime when the location.search parameter (query parameters) are changing, we are adding the new parameters to the
// link, so that for example a change of the selected time range is also used in the details page.
const DetailsLink: React.FunctionComponent<IDetailsLinkProps> = ({ application }: IDetailsLinkProps) => {
  const location = useLocation();

  const [link, setLink] = useState<string>(
    `/applications/${application.getCluster()}/${application.getNamespace()}/${application.getName()}`,
  );

  useEffect(() => {
    setLink(
      `/applications/${application.getCluster()}/${application.getNamespace()}/${application.getName()}${
        location.search
      }`,
    );
  }, [application, location.search]);

  return <Link to={link}>Details</Link>;
};

export default DetailsLink;
