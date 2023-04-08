import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
  Autocomplete,
  AutocompleteChangeReason,
  Checkbox,
  Chip,
  TextField,
  createFilterOptions,
  FilterOptionsState,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useContext, FunctionComponent, SyntheticEvent } from 'react';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;
const selectAllValue = 'Select all';

/**
 * `IResourcesSelectClustersProps` is the interface for the `ResourcesSelectClusters` component, which requires a list
 * of clusters and a function to change the selected clusters.
 */
interface IResourcesSelectClustersProps {
  selectClusters: (clusters: string[]) => void;
  selectedClusters: string[];
}

/**
 * The `ResourcesSelectClusters` renders a select box, which allows a user to select a list of clusters, to filter the
 * shown resources on a page. The component is also responsible for loading the clusters from our API.
 */
export const ResourcesSelectClusters: FunctionComponent<IResourcesSelectClustersProps> = ({
  selectedClusters,
  selectClusters,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const filter = createFilterOptions<string>();

  const { isLoading, data } = useQuery<string[], APIError>(['core/clusters'], async () => {
    return apiContext.client.get<string[]>('/api/clusters');
  });

  /**
   * `onChange` handles select, remove and clear operation of the `Autocomplete` component. This is required so that we
   * can handle the `Select all` option. When the user clicks on this option we add all clusters to the list of selected
   * clusters or when the list already contains all clusters we remove all clusters.
   *
   * When another option is select we add / remove the selected option as usual. When the clear button was clicked we
   * remove all selected clusters.
   *
   * See: https://github.com/mui/material-ui/issues/21211
   */
  const onChange = (e: SyntheticEvent, value: string[], reason: AutocompleteChangeReason) => {
    if (reason === 'selectOption' || reason === 'removeOption') {
      if (value.find((option) => option === selectAllValue)) {
        if (data?.length === selectedClusters.length) {
          selectClusters([]);
        } else {
          selectClusters(data ?? []);
        }
      } else {
        selectClusters(value);
      }
    } else if (reason === 'clear') {
      selectClusters([]);
    }
  };

  return (
    <Autocomplete
      size="small"
      multiple={true}
      disableCloseOnSelect={true}
      loading={isLoading}
      options={data ?? []}
      getOptionLabel={(option) => option ?? ''}
      filterOptions={(options: string[], state: FilterOptionsState<string>) => {
        const filtered = filter(options, state);
        if (!data || data.length === 0) {
          return filtered;
        }
        return [selectAllValue, ...filtered];
      }}
      value={selectedClusters}
      onChange={onChange}
      renderTags={(value) => <Chip size="small" label={value.length} />}
      renderOption={(props, option, { selected }) =>
        option === selectAllValue ? (
          <li {...props} style={{ padding: 1 }}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={data?.length === selectedClusters.length}
            />
            {option}
          </li>
        ) : (
          <li {...props} style={{ padding: 1 }}>
            <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )
      }
      renderInput={(params) => <TextField {...params} label="Clusters" placeholder="Clusters" />}
    />
  );
};
