import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import React, { useState } from 'react';

import { COLOR_DANGER, COLOR_INFO, COLOR_WARNING } from '../../../utils/helpers';
import { IVulnerabilityDetails } from '../../../utils/interfaces';

const formateVulnerability = (vulnerability: IVulnerabilityDetails): React.ReactNode | string => {
  if (vulnerability.links && vulnerability.links.length > 0) {
    return (
      <a href={vulnerability.links[0]} target="_blank" rel="noreferrer">
        {vulnerability.id}
      </a>
    );
  }

  return vulnerability.id;
};

const formatSeverity = (severity: string): React.ReactNode => {
  if (severity === 'Critical' || severity === 'High') {
    return <span style={{ color: COLOR_DANGER }}>{severity}</span>;
  } else if (severity === 'Medium') {
    return <span style={{ color: COLOR_WARNING }}>{severity}</span>;
  } else if (severity === 'Low') {
    return <span style={{ color: COLOR_INFO }}>{severity}</span>;
  } else {
    return <span>{severity}</span>;
  }
};

interface IVulnerabilitiesRowProps {
  vulnerability: IVulnerabilityDetails;
}

const VulnerabilitiesRow: React.FunctionComponent<IVulnerabilitiesRowProps> = ({
  vulnerability,
}: IVulnerabilitiesRowProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          noPadding={true}
          style={{ padding: 0 }}
          expand={{ isExpanded: isExpanded, onToggle: (): void => setIsExpanded(!isExpanded), rowIndex: 0 }}
        />
        <Td>{formateVulnerability(vulnerability)}</Td>
        <Td>{formatSeverity(vulnerability.severity)}</Td>
        <Td>{vulnerability.package}</Td>
        <Td>{vulnerability.version}</Td>
        <Td>{vulnerability.fix_version}</Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={6}>
          <ExpandableRowContent>{vulnerability.description}</ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default VulnerabilitiesRow;
