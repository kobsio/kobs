import { KeyboardArrowDown } from '@mui/icons-material';
import { Button, darken, Menu, MenuItem, Pagination as MUIPagination, Stack } from '@mui/material';
import { FunctionComponent, MouseEvent, useState } from 'react';

/**
 * `IPaginationProps` is the interface for the `Pagination` component.
 */
interface IPaginationProps {
  count: number;
  handleChange: (page: number, perPage: number) => void;
  page: number;
  perPage: number;
  size?: 'small' | 'medium';
}

/**
 * The `Pagination` component can be used to show a pagination within another component. It will show a list of pages
 * and a select box to select the items per page.
 */
const Pagination: FunctionComponent<IPaginationProps> = ({ handleChange, count, page, perPage, size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpen` opens the menu to select the items per page.
   */
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * `handleClose` closes the menu to select the items per page.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `handleSelect` is the handler to set the selected items per page option. We also close the menu once the a value
   * was selected.
   */
  const handleSelect = (value: number) => {
    handleChange(1, value);
    setAnchorEl(null);
  };

  /**
   * We want to use the same style as in Patternfly for our pagination component, therefor we have to do some math, to
   * calculate the `firstIndex` and `lastIndex` of the items which are shown on the current page. The implementation in
   * Patternfly can be found in the following components:
   *
   * - https://github.com/patternfly/patternfly-react/blob/15626ee299af769871fd0852efd69373fa1e49b5/packages/react-core/src/components/Pagination/Pagination.tsx#L234
   * - https://github.com/patternfly/patternfly-react/blob/15626ee299af769871fd0852efd69373fa1e49b5/packages/react-core/src/components/Pagination/ToggleTemplate.tsx#L20
   */
  let pageInternal = page;
  if (!pageInternal && 0) {
    pageInternal = Math.ceil(0 / perPage);
  }
  if (pageInternal === 0 && !count) {
    pageInternal = 1;
  }

  const lastPage = count || count === 0 ? Math.ceil(count / perPage) || 0 : page + 1;
  let firstIndex = (pageInternal - 1) * perPage + 1;
  let lastIndex = pageInternal * perPage;

  if (count || count === 0) {
    firstIndex = count <= 0 ? 0 : (pageInternal - 1) * perPage + 1;

    if (pageInternal < 1 && count > 0) {
      pageInternal = 1;
    } else if (page > lastPage) {
      pageInternal = lastPage;
    }

    if (count >= 0) {
      lastIndex = pageInternal === lastPage || count === 0 ? count : pageInternal * perPage;
    }
  }

  return (
    <Stack direction="row" justifyContent="flex-end" minWidth="100%" spacing={4}>
      <Button color="inherit" endIcon={<KeyboardArrowDown />} onClick={handleOpen}>
        {firstIndex} - {lastIndex} of {count}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {[10, 20, 50, 100].map((i) => (
          <MenuItem
            key={i}
            value={i}
            onClick={() => handleSelect(i)}
            sx={(theme) => ({
              backgroundColor: i === perPage ? darken(theme.palette.background.paper, 0.13) : undefined,
            })}
          >
            {i} per page
          </MenuItem>
        ))}
      </Menu>
      <MUIPagination size={size} count={lastPage} page={page} onChange={(e, value) => handleChange(value, perPage)} />
    </Stack>
  );
};

export default Pagination;
