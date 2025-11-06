import { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Custom render with providers
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
      ...options,
    }),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
