import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

test('renders TODO App heading', async () => {
  const testQueryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  const headingElement = await screen.findByText(/TODO App/i);
  expect(headingElement).toBeInTheDocument();
});

test('calls DELETE API when delete button is clicked', async () => {
  const testQueryClient = createTestQueryClient();
  const mockTodos = [
    { id: 1, title: 'Test Todo', completed: false },
  ];

  global.fetch.mockImplementation((url) => {
    if (url.includes('/api/todos') && !url.includes('/toggle')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for todo to appear
  await screen.findByText('Test Todo');

  // Click delete button
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  await userEvent.click(deleteButton);

  // Verify DELETE API was called
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/todos/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

test('calculates and displays correct incomplete count', async () => {
  const testQueryClient = createTestQueryClient();
  const mockTodos = [
    { id: 1, title: 'Todo 1', completed: false },
    { id: 2, title: 'Todo 2', completed: true },
    { id: 3, title: 'Todo 3', completed: false },
  ];

  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockTodos),
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Verify incomplete count
  await screen.findByText('2 items left');
});

test('calculates and displays correct completed count', async () => {
  const testQueryClient = createTestQueryClient();
  const mockTodos = [
    { id: 1, title: 'Todo 1', completed: false },
    { id: 2, title: 'Todo 2', completed: true },
    { id: 3, title: 'Todo 3', completed: true },
  ];

  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockTodos),
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Verify completed count
  await screen.findByText('2 completed');
});

test('displays empty state message when no todos', async () => {
  const testQueryClient = createTestQueryClient();

  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Verify empty state message appears
  await screen.findByText(/no todos yet/i);
});

test('handles API fetch errors gracefully', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock a failed fetch
  global.fetch.mockRejectedValue(new Error('Network error'));

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Verify error message appears
  await screen.findByText(/error loading todos/i);
});

test('handles non-ok API responses', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock a non-ok response
  global.fetch.mockResolvedValue({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: 'Server error' }),
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Verify error handling
  await screen.findByText(/error loading todos/i);
});

afterEach(() => {
  jest.clearAllMocks();
});
