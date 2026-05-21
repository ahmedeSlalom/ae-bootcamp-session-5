---
description: "Create UI tests for required critical user journeys"
agent: "test-engineer"
tools: ['search', 'read', 'edit', 'execute', 'todo']
---

# Create UI Tests for Critical Journeys

Create Playwright UI tests for critical user journeys in the TODO application.

## User Input

**Journeys** (optional): ${input:journeys:Enter specific journeys to test (or leave blank for default set)}

## Default Critical Journeys

If no specific journeys are provided, use this default set:
1. **Create TODO** - User adds a new TODO to the list
2. **Edit TODO** - User modifies existing TODO text
3. **Toggle TODO** - User marks TODO as complete/incomplete
4. **Delete TODO** - User removes a TODO from the list
5. **Error State Handling** - Application handles API errors gracefully

## HARD LIMIT: Maximum 5 Playwright Tests

**CRITICAL CONSTRAINT**: Create a maximum of **5 Playwright test cases** in this run.

Target: **3-5 total test cases** including at least 1 error-path test.

**If more than 5 candidate scenarios exist:**
- Select the **highest-risk 5 journeys** to test
- List remaining scenarios as "Deferred for future coverage"
- DO NOT create more than 5 tests

**Before finishing:**
- Count all `test(...)` or `it(...)` blocks created
- If count > 5, reduce to the 5 most critical
- Report actual count created

## Instructions

### 1. Review Existing Test Structure

Check the current test setup:

```bash
# List existing UI test files
ls -la packages/frontend/tests/ui/

# Check if Page Object structure exists
ls -la packages/frontend/tests/ui/pages/

# Review existing tests
cat packages/frontend/tests/ui/*.spec.js
```

### 2. Create Page Object Model (POM) Structure

**If POM doesn't exist, create it:**

```
packages/frontend/tests/ui/
├── pages/
│   ├── TodoPage.js      # Page object for TODO interactions
│   └── BasePage.js      # (optional) Shared page functionality
├── fixtures/            # (optional) Test data and helpers
└── journeys.spec.js     # Test scenarios (or multiple spec files)
```

**TodoPage.js should include:**
- Selectors defined once (use getByRole, getByLabel, or data-testid)
- Reusable interaction methods (addTodo, deleteTodo, toggleTodo, etc.)
- State verification methods (getTodoCount, isTodoVisible, etc.)
- State-based waits (waitForResponse, not waitForTimeout)

**Example TodoPage structure:**
```javascript
export class TodoPage {
  constructor(page) {
    this.page = page;
    // Define selectors once
    this.todoInput = page.getByTestId('todo-input');
    this.addButton = page.getByRole('button', { name: /add/i });
    this.todoItem = (text) => page.getByTestId('todo-item').filter({ hasText: text });
  }

  async goto() {
    await this.page.goto('http://localhost:3000');
  }

  async addTodo(text) {
    await this.todoInput.fill(text);
    await this.addButton.click();
    // State-based wait
    await this.page.waitForResponse(resp => 
      resp.url().includes('/api/todos') && resp.status() === 201
    );
  }

  // More reusable methods...
}
```

### 3. Create Test Scenarios (Max 5 Total)

**For each selected journey (up to 5):**

Create a `test(...)` block that:
1. Uses the Page Object Model for interactions
2. Reads like a user story
3. Uses stable selectors (prefer getByRole, getByLabel, data-testid)
4. Uses state-based waits (no arbitrary timeouts)
5. Has clear assertions

**Example test structure:**
```javascript
import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('TODO Application Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should create a new todo', async () => {
    await todoPage.addTodo('Buy groceries');
    
    expect(await todoPage.isTodoVisible('Buy groceries')).toBe(true);
    expect(await todoPage.getTodoCount()).toBe(1);
  });

  test('should delete a todo', async () => {
    await todoPage.addTodo('Buy groceries');
    await todoPage.deleteTodo('Buy groceries');
    
    expect(await todoPage.isTodoVisible('Buy groceries')).toBe(false);
  });

  // Maximum 5 tests total - be selective!
});
```

### 4. Include Error-Path Test (Within 5 Total)

**At least 1 of the 5 tests must cover error handling:**

Examples:
- API returns 500 error
- Network timeout
- Invalid input handling
- Empty state scenarios

**Example error test:**
```javascript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/todos', route => 
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  );
  
  await todoPage.addTodo('Test todo');
  
  // Verify error message is shown
  const errorMsg = page.getByRole('alert');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText(/error|failed/i);
});
```

### 5. Verify Test Count (CRITICAL)

**Before completing, count the tests:**

```bash
# Count test blocks created
grep -c "test(" packages/frontend/tests/ui/*.spec.js
grep -c "it(" packages/frontend/tests/ui/*.spec.js
```

**If count > 5:**
- Remove lower-priority tests
- Keep only the 5 most critical journeys
- Document removed scenarios as "Deferred"

**Report format:**
```
Created Playwright Tests: X/5
- Create TODO journey
- Delete TODO journey
- Toggle TODO journey
- Error handling
(+ 1 more)

Deferred for future coverage:
- Multi-todo operations
- Filter/sort functionality
```

### 6. Validate Selector Strategy

Ensure selectors follow priority order:
1. ✅ **Accessibility-first**: `getByRole`, `getByLabel` (BEST)
2. ✅ **Test IDs**: `getByTestId` (GOOD)
3. ⚠️ **Text content**: `getByText` (USE CAREFULLY)
4. ❌ **CSS selectors**: `.class`, `#id` (AVOID)

**If CSS selectors are found, refactor to use better strategies.**

### 7. Validate Wait Strategy

Ensure NO arbitrary timeouts:

```bash
# Check for problematic patterns
grep -n "waitForTimeout" packages/frontend/tests/ui/*.spec.js
grep -n "setTimeout" packages/frontend/tests/ui/*.spec.js
```

**If found, replace with state-based waits:**
- `waitForResponse` for network calls
- `waitForSelector` with state option
- `expect(...).toBeVisible()` with auto-wait

### 8. Report Results

Provide a clear summary:

```
## UI Tests Created

✅ Created/Updated Files:
- packages/frontend/tests/ui/pages/TodoPage.js (Page Object)
- packages/frontend/tests/ui/journeys.spec.js (Test scenarios)

✅ Playwright Test Cases: 5/5
1. Create TODO journey
2. Delete TODO journey
3. Toggle TODO completion
4. Edit TODO text
5. API error handling (error-path)

✅ Patterns Applied:
- Page Object Model for reusability
- Stable selectors (getByRole, data-testid)
- State-based waits (no arbitrary timeouts)
- Isolated tests (no shared state)

Next steps:
1. Run: /run-ui-tests
2. After tests pass: /validate-step {step-number}
```

## Selector Guidelines

**Priority (from [test-engineer agent](../agents/test-engineer.agent.md)):**

1. **Accessibility-first** (BEST):
   ```javascript
   page.getByRole('button', { name: /add/i })
   page.getByLabel('Todo input')
   ```

2. **Test IDs** (GOOD):
   ```javascript
   page.getByTestId('todo-input')
   page.getByTestId('todo-item')
   ```

3. **Text content** (USE CAREFULLY):
   ```javascript
   page.getByText('Buy groceries')
   ```

4. **CSS selectors** (AVOID):
   ```javascript
   page.locator('.todo-item') // FRAGILE!
   ```

## Page Object Model Benefits

- **Reusability**: Write interaction logic once, use in all tests
- **Maintainability**: Change selectors in one place
- **Readability**: Tests read like user stories
- **Debuggability**: Page methods are reusable for debugging

## Workflow Context

This prompt uses knowledge from:
- **Test Engineer Agent** ([.github/agents/test-engineer.agent.md](../agents/test-engineer.agent.md))
- **Testing Scope** section in copilot-instructions.md (Playwright for UI)
- **Critical Journey Coverage** from test-engineer agent

## Agent Context

This prompt automatically switches to the `test-engineer` agent, which:
- Specializes in Playwright UI test automation
- Implements Page Object Model patterns
- Uses stable selectors and state-based waits
- Ensures test isolation and determinism
- Does NOT fix application code (hands off to tdd-developer)

## Notes

- **HARD LIMIT**: Maximum 5 Playwright tests per run
- Must include at least 1 error-path test within the 5
- If >5 scenarios exist, select highest-risk 5 and defer others
- Always use Page Object Model pattern
- Prefer stable, accessibility-first selectors
- Use state-based waits, never arbitrary timeouts
- DO NOT claim "small scope" if you create more than 5 tests
- Count and verify before finishing
