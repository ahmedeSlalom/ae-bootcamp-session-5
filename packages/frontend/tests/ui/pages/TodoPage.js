/**
 * TodoPage - Page Object Model for TODO Application
 * 
 * Encapsulates all interactions with the TODO app UI.
 * Uses stable, accessibility-first selectors and state-based waits.
 */
class TodoPage {
  constructor(page) {
    this.page = page;
    
    // Selectors defined once - using accessibility-first approach
    this.todoInput = () => page.getByPlaceholder('What needs to be done?');
    this.addButton = () => page.getByRole('button', { name: /add/i });
    this.emptyStateMessage = () => page.getByText(/no todos yet/i);
    this.errorMessage = () => page.getByText(/error loading todos/i);
    
    // Stats selectors
    this.itemsLeftChip = () => page.getByText(/items left/i);
    this.completedChip = () => page.getByText(/completed/i);
  }

  /**
   * Navigate to the TODO application
   */
  async goto() {
    await this.page.goto('http://localhost:3000');
    // Wait for app to be ready
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new TODO item
   * @param {string} title - The title of the TODO
   */
  async addTodo(title) {
    await this.todoInput().fill(title);
    
    // Set up response waiter BEFORE clicking (avoids race condition)
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/todos') && 
                  response.request().method() === 'POST' &&
                  response.status() === 201,
      { timeout: 5000 }
    );
    
    await this.addButton().click();
    await responsePromise;
  }

  /**
   * Delete a TODO by its title
   * @param {string} title - The title of the TODO to delete
   */
  async deleteTodo(title) {
    const todoItem = this.getTodoItemByTitle(title);
    const deleteButton = todoItem.getByRole('button', { name: /delete/i });
    
    // Set up response waiter BEFORE clicking (avoids race condition)
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/todos') && 
                  response.request().method() === 'DELETE' &&
                  response.status() === 200,
      { timeout: 5000 }
    );
    
    await deleteButton.click();
    await responsePromise;
  }

  /**
   * Toggle a TODO's completion status
   * @param {string} title - The title of the TODO to toggle
   */
  async toggleTodo(title) {
    const todoItem = this.getTodoItemByTitle(title);
    const checkbox = todoItem.getByRole('checkbox');
    
    // Set up response waiter BEFORE clicking (avoids race condition)
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/toggle') && 
                  response.request().method() === 'PATCH',
      { timeout: 5000 }
    );
    
    await checkbox.click();
    await responsePromise;
  }

  /**
   * Get a TODO item element by its title
   * @param {string} title - The title of the TODO
   * @returns {Locator} - The TODO item locator
   */
  getTodoItemByTitle(title) {
    // Find the listitem that contains this title text
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  /**
   * Check if a TODO is visible
   * @param {string} title - The title of the TODO
   * @returns {Promise<boolean>}
   */
  async isTodoVisible(title) {
    try {
      await this.getTodoItemByTitle(title).waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a TODO is completed (has strikethrough)
   * @param {string} title - The title of the TODO
   * @returns {Promise<boolean>}
   */
  async isTodoCompleted(title) {
    const todoItem = this.getTodoItemByTitle(title);
    const checkbox = todoItem.getByRole('checkbox');
    return await checkbox.isChecked();
  }

  /**
   * Get the count of visible TODO items
   * @returns {Promise<number>}
   */
  async getTodoCount() {
    const todos = await this.page.getByRole('listitem').all();
    return todos.length;
  }

  /**
   * Check if empty state is visible
   * @returns {Promise<boolean>}
   */
  async isEmptyStateVisible() {
    try {
      await this.emptyStateMessage().waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    try {
      await this.errorMessage().waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the incomplete count from the stats
   * @returns {Promise<number>}
   */
  async getIncompleteCount() {
    const text = await this.itemsLeftChip().textContent();
    const match = text.match(/(\d+)\s+items left/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get the completed count from the stats
   * @returns {Promise<number>}
   */
  async getCompletedCount() {
    const text = await this.completedChip().textContent();
    const match = text.match(/(\d+)\s+completed/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Wait for stats to show expected counts
   * @param {number} incomplete - Expected incomplete count
   * @param {number} completed - Expected completed count
   */
  async waitForStats(incomplete, completed) {
    await this.page.waitForFunction(
      ({ incomplete, completed }) => {
        const itemsLeftText = document.querySelector('div[class*="MuiChip"]')?.textContent || '';
        const completedText = document.querySelectorAll('div[class*="MuiChip"]')[1]?.textContent || '';
        const currentIncomplete = parseInt(itemsLeftText.match(/(\d+)/)?.[1] || '0');
        const currentCompleted = parseInt(completedText.match(/(\d+)/)?.[1] || '0');
        return currentIncomplete === incomplete && currentCompleted === completed;
      },
      { incomplete, completed },
      { timeout: 3000 }
    );
  }
}

module.exports = { TodoPage };
