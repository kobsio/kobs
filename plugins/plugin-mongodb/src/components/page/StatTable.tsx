import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { IStatsData } from '../../utils/interfaces';
import React from 'react';
import { humanReadableSize } from '../../utils/helpers';

interface IStatsTableProps {
  data: IStatsData;
}

const StatTable: React.FunctionComponent<IStatsTableProps> = ({ data }: IStatsTableProps) => {
  return (
    <TableComposable aria-label="DatabaseStats" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th tooltip={null}>Metric</Th>
          <Th tooltip={null}>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>Database name</Td>
          <Td>{data.db}</Td>
        </Tr>
        <Tr>
          <Td>Number of collections</Td>
          <Td>{data.collections}</Td>
        </Tr>
        <Tr>
          <Td>Number of views</Td>
          <Td>{data.views}</Td>
        </Tr>
        <Tr>
          <Td>Number of objects</Td>
          <Td>{data.objects}</Td>
        </Tr>
        <Tr>
          <Td>Average object size</Td>
          <Td>{humanReadableSize(data.avgObjSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total data size</Td>
          <Td>{humanReadableSize(data.dataSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total allocated storage size</Td>
          <Td>{humanReadableSize(data.storageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total free storage size</Td>
          <Td>{humanReadableSize(data.freeStorageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Number of indexes</Td>
          <Td>{data.indexes}</Td>
        </Tr>
        <Tr>
          <Td>Total index size</Td>
          <Td>{humanReadableSize(data.indexSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total free index size</Td>
          <Td>{humanReadableSize(data.indexFreeStorageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total size (indices + data)</Td>
          <Td>{humanReadableSize(data.totalSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total free size</Td>
          <Td>{humanReadableSize(data.totalFreeStorageSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total used filesystem size</Td>
          <Td>{humanReadableSize(data.fsUsedSize)}</Td>
        </Tr>
        <Tr>
          <Td>Total filesystem size</Td>
          <Td>{humanReadableSize(data.fsTotalSize)}</Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

export default StatTable;
