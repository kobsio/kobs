import { render, screen, waitFor } from '@testing-library/react';

import {
  DescriptionList,
  DescriptionListGroup,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListDescription,
} from './DescriptionList';

describe('DescriptionList', () => {
  it('should render the description list', async () => {
    render(
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Term 1</DescriptionListTerm>
          <DescriptionListDescription>Description 1</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Term 2</DescriptionListTerm>
          <DescriptionListDescription direction="column">
            <div>Description 2 - 1</div>
            <div>Description 2 - 2</div>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListItem>Item 1</DescriptionListItem>
        </DescriptionListGroup>
      </DescriptionList>,
    );

    expect(await waitFor(() => screen.getByText(/Term 1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Description 1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Term 2/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Description 2 - 1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Description 2 - 2/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Item 1/))).toBeInTheDocument();
  });
});
