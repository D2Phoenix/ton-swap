import { screen } from '@testing-library/react';

import { render } from 'utils/testUtils';

import App from './App';

test('Render App', () => {
  render(<App />);

  expect(screen.getByText(/TONSwap/i)).toBeInTheDocument();
});
