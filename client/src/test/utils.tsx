import { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ResumeFormProvider } from '../contexts/ResumeFormContext';
import userEvent from '@testing-library/user-event';

// Custom render with providers
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>
            <ResumeFormProvider>{children}</ResumeFormProvider>
          </AuthProvider>
        </BrowserRouter>
      ),
      ...options,
    }),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
