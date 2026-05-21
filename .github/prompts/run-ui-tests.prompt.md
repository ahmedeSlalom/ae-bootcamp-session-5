---
description: "Run UI tests and summarize failures"
agent: "test-engineer"
tools: ['read', 'execute', 'todo']
---

# Run UI Tests and Summarize Results

Execute the Playwright UI test suite and provide a clear summary of pass/fail results with failure triage.

## Instructions

### 0. REQUIRED: Install Playwright Dependencies (First Step)

**CRITICAL**: Before running UI tests, you MUST install Playwright browsers and dependencies.

**Run this command from the repository root:**
```bash
npm run test:ui:install --workspace=frontend
```

**Ubuntu/Linux Environment Requirements:**
- In Ubuntu/Linux environments, this step is **MANDATORY**
- `test:ui:install` must perform: `playwright install --with-deps chromium`
- The `--with-deps` flag installs all required system dependencies
- Without this, Playwright tests will fail with missing library errors

**Automated Remediation:**
- `test:ui:install` now includes automatic bounded Ubuntu repository remediation for the common Yarn GPG key issue
- It performs one retry if the initial install fails due to Yarn key issues
- Remediation uses `add-apt-repository --remove` and `apt-key del` (bounded scope)

**Failure Handling:**
- If `test:ui:install` fails after the automated remediation and retry:
  - STOP IMMEDIATELY
  - Report the failure as an **environment blocker**
  - Include the failing command and key error lines from output
  - Do NOT continue to run Playwright tests after a failed dependency install
  - Do NOT perform ad-hoc package hunting or broad OS troubleshooting beyond the automated remediation

**When to run this:**
- Before EVERY first UI test run in a new environment
- After container rebuilds
- After Playwright version updates
- If you see errors like: `Error: browserType.launch: Executable doesn't exist`

**Verification:**
```bash
# After install, verify browsers are installed
npx playwright --version
ls ~/.cache/ms-playwright/
```

### 1. Verify Application is Running

**CRITICAL**: Both backend and frontend must be running before UI tests.

**Check if servers are running:**
```bash
# Check for running processes
ps aux | grep node

# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
```

**If servers are NOT running, start them from repo root:**
```bash
# Start both servers (from repository root)
npm start
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend server on `http://localhost:3000`

**Wait for servers to be ready** (look for "started" messages in output).

### 2. Run UI Test Suite

Execute Playwright tests:

```bash
# From repository root or frontend directory
npm run test:ui --workspace=frontend

# OR from frontend directory
cd packages/frontend && npm run test:ui
```

**Test execution options:**

```bash
# Run with headed browser (watch tests run)
npm run test:ui -- --headed

# Run specific test file
npm run test:ui -- tests/ui/journeys.spec.js

# Run with UI mode (interactive debugging)
npm run test:ui -- --ui

# Run in specific browser
npm run test:ui -- --project=chromium
```

### 3. Capture Test Output

Collect key information from test run:
- Total tests run
- Number passed
- Number failed
- Test duration
- Failed test names and locations
- Error messages and stack traces

### 4. Summarize Results

**Provide a clear, structured summary:**

```
## UI Test Results Summary

✅ Passed: X tests
❌ Failed: Y tests
⏭️  Skipped: Z tests

Total Duration: X.Xs

[If all tests passed:]
✅ All UI tests passed! Critical journeys are working correctly.

[If tests failed:]
❌ Failed Tests:

1. "should create a new todo"
   - File: tests/ui/journeys.spec.js:23
   - Error: Timeout waiting for selector '[data-testid="todo-item"]'
   - Duration: 30.5s

2. "should handle API errors gracefully"
   - File: tests/ui/journeys.spec.js:45
   - Error: Expected error message to be visible
   - Duration: 5.2s
```

### 5. Classify Each Failure

For each failing test, classify the likely root cause:

#### Classification Categories

**1. Application Code Defect** (Most Common)
- Test expectations are correct
- Application behavior doesn't match requirements
- Business logic bug

**Examples:**
- Delete button doesn't remove TODO
- API returns wrong status code
- State doesn't update after action

**Action:** Hand off to `tdd-developer` to fix application code

---

**2. Test Code Defect**
- Incorrect test expectations
- Flaky selectors or waits
- Test logic errors
- Race conditions in test

**Examples:**
- Wrong element selector
- Missing async/await
- Incorrect assertion expectations
- Test isolation issues

**Action:** Fix the test code directly

---

**3. Environment Issue**
- Tests pass locally but fail in CI
- Timing-dependent failures
- Missing dependencies
- Configuration problems

**Examples:**
- Application server not running
- Playwright browsers not installed
- Port conflicts
- Network timeout

**Action:** Fix environment setup or configuration

### 6. Provide Detailed Triage

**For each failed test, provide:**

```
### Test: "should create a new todo"

**Classification:** [Application Code | Test Code | Environment]

**Root Cause:**
[Clear explanation of why the test failed]

**Evidence:**
- [Specific observations from error message]
- [Relevant console/network output]
- [Expected vs actual behavior]

**Recommended Fix:**
[Specific action to resolve the failure]

**Next Steps:**
- If Application Code: Switch to @tdd-developer to fix implementation
- If Test Code: Update test in [file:line]
- If Environment: [specific environment fix needed]
```

### 7. Example Triage Output

```
## Failure Triage

### Test 1: "should create a new todo"

**Classification:** Application Code Defect

**Root Cause:**
- Test expects TODO to appear in list after clicking Add button
- TODO input clears but item doesn't appear in the DOM
- Network request returns 201, but frontend state doesn't update

**Evidence:**
- Add button click registered (console shows event)
- POST /api/todos returns 201 with correct data
- useState setter not called after successful POST
- DOM query for todo-item returns empty

**Recommended Fix:**
- Check if onSubmit handler updates state after API call
- Verify setTodos is called with new todo
- Likely missing state update in handleAddTodo function

**Next Steps:**
Switch to @tdd-developer to:
1. Review handleAddTodo in App.js
2. Add state update after successful API call
3. Re-run UI tests to verify fix

---

### Test 2: "should display error message"

**Classification:** Test Code Defect

**Root Cause:**
- Test expects error message with role="alert"
- Application shows error with role="status"
- Test selector is too specific

**Evidence:**
- Error message IS displayed in browser
- Manual inspection shows role="status" not role="alert"
- Test fails on selector, not on presence of message

**Recommended Fix:**
Update test selector in journeys.spec.js:
```javascript
// Change from:
const errorMsg = page.getByRole('alert');

// To:
const errorMsg = page.getByTestId('error-message');
// OR
const errorMsg = page.getByText(/error|failed/i);
```

**Next Steps:**
1. Update test selector in tests/ui/journeys.spec.js:52
2. Re-run UI tests to verify fix
```

### 8. Summary and Recommendations

After triaging all failures, provide overall summary:

```
## Summary

Total Failures: X
- Application Code: Y (hand off to tdd-developer)
- Test Code: Z (fix in this prompt)
- Environment: W (fix configuration)

## Priority Actions

1. [Highest priority fix with specific file/action]
2. [Next priority fix]
3. [Additional fixes]

## Next Commands

[If application code fixes needed:]
- Switch to @tdd-developer mode
- Fix implementation issues listed above
- Re-run: /run-ui-tests

[If test code fixes only:]
- Update test files as specified above
- Re-run: /run-ui-tests

[If all tests pass:]
- Proceed to: /validate-step {step-number}
```

## Debugging Failed Tests

**If tests fail and cause is unclear, use debugging tools:**

```bash
# Run with headed browser to watch
npm run test:ui -- --headed

# Run with debug mode (step through)
npm run test:ui -- --debug

# Generate trace for failed test
npm run test:ui -- --trace on

# View trace
npx playwright show-trace trace.zip
```

**Add screenshots to failing tests:**
```javascript
test('my test', async ({ page }) => {
  try {
    // test code
  } catch (error) {
    await page.screenshot({ path: 'failure-screenshot.png' });
    throw error;
  }
});
```

## Workflow Context

This prompt uses knowledge from:
- **Test Engineer Agent** ([.github/agents/test-engineer.agent.md](../agents/test-engineer.agent.md))
- **Testing Scope** section in copilot-instructions.md (Playwright commands)
- **Failure Classification** from test-engineer agent

## Agent Context

This prompt automatically switches to the `test-engineer` agent, which:
- Runs and analyzes UI test results
- Triages failures into app/test/environment categories
- Provides specific, actionable fix recommendations
- Hands off application bugs to tdd-developer
- Does NOT fix application code directly

## Common Test Failures

**Timeout waiting for selector:**
- Usually indicates element not rendered
- Check if API call succeeded
- Verify state update logic
- May be application bug or incorrect selector

**Assertion failure:**
- Expected behavior doesn't match actual
- Could be test expectation wrong
- Could be application behavior wrong
- Review both test and implementation

**Network errors:**
- API server not running
- Wrong API URL
- CORS issues
- Check server logs

**Element not found:**
- Selector may be incorrect
- Element might not exist in current state
- Check for typos in data-testid or role

## Notes

- Always run `test:ui:install` before first UI test execution
- Ensure backend and frontend are running before tests
- Provide clear classification for each failure
- Be specific about recommended fixes
- Hand off application bugs to tdd-developer
- Fix test code issues directly in this prompt
- Report environment issues clearly with specific fixes needed
