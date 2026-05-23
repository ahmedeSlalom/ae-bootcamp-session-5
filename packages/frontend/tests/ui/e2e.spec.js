/**
 * TODO Application - Critical User Journey Tests
 * 
 * Test Count: 5/5 (HARD LIMIT)
 * - Create TODO journey
 * - Toggle TODO completion
 * - Delete TODO journey
 * - Empty state handling
 * - API error handling (error-path)
 * 
 * Pattern: Page Object Model for maintainability
 * Selectors: Accessibility-first (getByRole, getByPlaceholder, getByText)
 * Waits: State-based (waitForResponse, not arbitrary timeouts)
 */

const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO Application - Critical Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    
    // Clean up any existing TODOs from previous test runs
    // This ensures test isolation since backend uses in-memory storage
    const todos = await page.evaluate(() => 
      fetch('http://localhost:3001/api/todos').then(r => r.json())
    );
    
    for (const todo of todos) {
      await page.evaluate((id) => 
        fetch(`http://localhost:3001/api/todos/${id}`, { method: 'DELETE' }),
        todo.id
      );
    }
    
    // Reload page to get fresh state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  /**
   * Journey 1: Create TODO
   * User adds a new TODO item to the list
   */
  test('should create a new todo item', async () => {
    // Add a new TODO
    await todoPage.addTodo('Buy groceries');
    
    // Verify TODO appears in the list
    expect(await todoPage.isTodoVisible('Buy groceries')).toBe(true);
    
    // Verify count is updated
    expect(await todoPage.getTodoCount()).toBe(1);
    
    // Verify stats show 1 incomplete item
    expect(await todoPage.getIncompleteCount()).toBe(1);
    expect(await todoPage.getCompletedCount()).toBe(0);
  });

  /**
   * Journey 2: Toggle TODO Completion
   * User marks a TODO as complete and then incomplete
   */
  test('should toggle todo completion status', async () => {
    // Create a TODO
    await todoPage.addTodo('Complete assignment');
    await todoPage.waitForStats(1, 0);
    
    // Verify it starts as incomplete
    expect(await todoPage.isTodoCompleted('Complete assignment')).toBe(false);
    expect(await todoPage.getIncompleteCount()).toBe(1);
    expect(await todoPage.getCompletedCount()).toBe(0);
    
    // Toggle to complete
    await todoPage.toggleTodo('Complete assignment');
    await todoPage.waitForStats(0, 1);
    
    // Verify it's now completed
    expect(await todoPage.isTodoCompleted('Complete assignment')).toBe(true);
    expect(await todoPage.getIncompleteCount()).toBe(0);
    expect(await todoPage.getCompletedCount()).toBe(1);
    
    // Toggle back to incomplete
    await todoPage.toggleTodo('Complete assignment');
    await todoPage.waitForStats(1, 0);
    
    // Verify it's incomplete again
    expect(await todoPage.isTodoCompleted('Complete assignment')).toBe(false);
    expect(await todoPage.getIncompleteCount()).toBe(1);
    expect(await todoPage.getCompletedCount()).toBe(0);
  });

  /**
   * Journey 3: Delete TODO
   * User removes a TODO from the list
   */
  test('should delete a todo item', async () => {
    // Create a TODO
    await todoPage.addTodo('Task to delete');
    
    // Verify it exists
    expect(await todoPage.isTodoVisible('Task to delete')).toBe(true);
    expect(await todoPage.getTodoCount()).toBe(1);
    
    // Delete it
    await todoPage.deleteTodo('Task to delete');
    
    // Verify it's gone
    expect(await todoPage.isTodoVisible('Task to delete')).toBe(false);
    expect(await todoPage.getTodoCount()).toBe(0);
    
    // Verify empty state appears
    expect(await todoPage.isEmptyStateVisible()).toBe(true);
  });

  /**
   * Journey 4: Empty State
   * Verify empty state message when no TODOs exist
   */
  test('should display empty state when no todos exist', async () => {
    // On initial load with no TODOs
    expect(await todoPage.isEmptyStateVisible()).toBe(true);
    expect(await todoPage.getTodoCount()).toBe(0);
    
    // Add a TODO
    await todoPage.addTodo('First todo');
    
    // Wait for TODO to appear and stats to update
    await todoPage.waitForStats(1, 0);
    await expect(todoPage.getTodoItemByTitle('First todo')).toBeVisible();
    
    // Empty state should disappear
    expect(await todoPage.isEmptyStateVisible()).toBe(false);
    expect(await todoPage.getTodoCount()).toBe(1);
    
    // Delete the TODO
    await todoPage.deleteTodo('First todo');
    
    // Wait for TODO to disappear
    await expect(todoPage.getTodoItemByTitle('First todo')).not.toBeVisible();
    
    // Empty state should reappear
    expect(await todoPage.isEmptyStateVisible()).toBe(true);
    expect(await todoPage.getTodoCount()).toBe(0);
  });

  /**
   * Journey 5: API Error Handling (ERROR-PATH TEST)
   * Application handles API errors gracefully
   */
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error response
    await page.route('**/api/todos', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        route.continue();
      }
    });
    
    // Navigate to the app
    await todoPage.goto();
    
    // Verify error message is displayed
    expect(await todoPage.isErrorVisible()).toBe(true);
    
    // Verify no TODOs are shown
    expect(await todoPage.getTodoCount()).toBe(0);
    
    // Verify empty state is NOT shown (error takes precedence)
    expect(await todoPage.isEmptyStateVisible()).toBe(false);
  });
});

/**
 * DEFERRED SCENARIOS (for future coverage):
 * - Edit TODO functionality (when implemented)
 * - Multi-todo operations (bulk actions)
 * - Persistence across page reloads
 * - Input validation (empty, max length)
 * - Keyboard navigation and accessibility
 */