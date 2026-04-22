// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';

describe('ServiceWorkerRegister', () => {
  it('renders without crashing', () => {
    render(<ServiceWorkerRegister />);
  });
});
