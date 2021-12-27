import { screen } from '@testing-library/react';

import App from './App';
import { render } from 'utils/testUtils';

test('Render App', () => {
  render(<App />);

  expect(screen.getByText(/TONSwap/i)).toBeInTheDocument();
});
