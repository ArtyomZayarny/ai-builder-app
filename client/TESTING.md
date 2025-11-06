# Frontend Testing Guide

## Test Stack

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Matchers**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event
- **Environment**: jsdom

## Running Tests

```bash
# Run tests in watch mode (for development)
npm test

# Run tests once (for CI/CD)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test using the `__tests__` directory convention:

```
src/
├── components/
│   ├── __tests__/
│   │   └── ResumeCard.test.tsx
│   └── ResumeCard.tsx
├── pages/
│   ├── __tests__/
│   │   └── Dashboard.test.tsx
│   └── Dashboard.tsx
└── test/
    ├── setup.ts       # Test setup and configuration
    └── utils.tsx      # Custom render with providers
```

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
it('handles button click', async () => {
  const { user } = render(<MyComponent />);

  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Testing Forms with Validation

```typescript
it('shows validation error', async () => {
  const { user } = render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, 'invalid-email');
  await user.tab(); // Blur to trigger validation

  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';
import * as api from '../../services/api';

vi.mock('../../services/api');

it('fetches data successfully', async () => {
  vi.mocked(api.getData).mockResolvedValue({ data: 'test' });

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Query Priority

Follow this order when querying elements:

1. `getByRole` - most accessible
2. `getByLabelText` - for form fields
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` - last resort

### 2. Async Operations

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 3. User Interactions

Always use `user-event` instead of `fireEvent`:

```typescript
const { user } = render(<MyComponent />);
await user.click(button);
await user.type(input, 'text');
```

### 4. Accessibility

Test for accessibility:

```typescript
// Good - uses accessible role
screen.getByRole('button', { name: /submit/i });

// Good - uses label
screen.getByLabelText(/email/i);

// Avoid - uses test IDs
screen.getByTestId('submit-button');
```

### 5. Test Isolation

Each test should be independent:

- Don't rely on test execution order
- Clean up after each test (automatic with setup)
- Mock external dependencies
- Reset mocks between tests

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Common Testing Scenarios

### Testing Components with Context

```typescript
import { ResumeFormProvider } from '../../contexts/ResumeFormContext';

function renderWithProvider(ui: ReactElement) {
  return render(
    <ResumeFormProvider>
      {ui}
    </ResumeFormProvider>
  );
}

it('uses context data', () => {
  renderWithProvider(<MyComponent />);
  // Test component
});
```

### Testing Error Boundaries

```typescript
it('handles errors gracefully', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(<ComponentThatThrows />);

  expect(screen.getByText(/error occurred/i)).toBeInTheDocument();

  consoleError.mockRestore();
});
```

### Testing with React Router

The custom render already includes Router. For navigation:

```typescript
import { MemoryRouter, Route, Routes } from 'react-router-dom';

it('navigates correctly', async () => {
  const { user } = render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  );

  await user.click(screen.getByRole('link', { name: /about/i }));

  expect(screen.getByText('About Page')).toBeInTheDocument();
});
```

## Debugging Tests

### View rendered HTML

```typescript
import { debug } from '@testing-library/react';

it('test', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints the rendered HTML
});
```

### Find elements

```typescript
screen.logTestingPlaygroundURL(); // Get Testing Playground URL
```

### Run specific tests

```bash
# Run only tests matching pattern
npm test Dashboard

# Run specific test file
npm test src/pages/__tests__/Dashboard.test.tsx

# Run tests in specific directory
npm test src/components
```

## CI/CD Integration

The `test:run` script is designed for CI/CD:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test:run

- name: Generate coverage
  run: npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
