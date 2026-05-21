---
description: "Validate that all success criteria for the current step are met"
agent: "code-reviewer"
tools: ['search', 'read', 'execute', 'web', 'todo']
---

# Validate Step Success Criteria

Validate that all success criteria for the specified step have been met.

## User Input

**Step Number** (REQUIRED): ${input:step-number:Enter the step number (e.g., 5-0, 5-1, 5-2)}

## Instructions

### 1. Verify Step Number Provided

The step number is REQUIRED. Format examples:
- `5-0` - Exercise 5, Step 0
- `5-1` - Exercise 5, Step 1
- `6-2` - Exercise 6, Step 2

If not provided, stop and ask the user to provide the step number.

### 2. Find the Main Exercise Issue

Use GitHub CLI to locate the exercise issue:

```bash
# The main exercise issue has "Exercise:" in the title
gh issue list --state open --search "Exercise:"
```

Extract the issue number from the results.

### 3. Retrieve Issue with Comments

```bash
# Get the full issue content including all comments
gh issue view <issue-number> --comments
```

### 4. Locate the Specified Step

Search through the issue content and comments to find:

```
# Step {step-number}: [Step Title]
```

For example, if validating step `5-1`, find:
```
# Step 5-1: [Title]
```

### 5. Extract Success Criteria

Within that step, locate the "Success Criteria" section. It typically looks like:

```
## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

Or:

```
Success Criteria:
1. Criterion 1
2. Criterion 2
3. Criterion 3
```

Parse all success criteria from this section.

### 6. Check Each Criterion

For each criterion, verify it against the current workspace state:

**Common criterion types and how to validate:**

**API Endpoint exists:**
```bash
# Check if endpoint is implemented
grep -r "app.post('/api/todos'" packages/backend/src/
grep -r "app.get('/api/todos'" packages/backend/src/
```

**Tests pass:**
```bash
# Run backend tests
cd packages/backend && npm test

# Run frontend tests
cd packages/frontend && npm test

# Check exit code
echo $?  # Should be 0 for success
```

**File exists:**
```bash
# Check if file exists
ls -la packages/backend/src/app.js
ls -la packages/frontend/src/components/TodoList.js
```

**Code contains specific implementation:**
```bash
# Search for specific code patterns
grep -n "useState" packages/frontend/src/App.js
grep -n "express.json()" packages/backend/src/app.js
```

**No lint errors:**
```bash
# Run linter
cd packages/backend && npm run lint
cd packages/frontend && npm run lint
```

**UI tests pass** (if criterion mentions UI/E2E/Playwright):
```bash
cd packages/frontend && npm run test:ui
```

**Server runs without errors:**
```bash
# Check if server starts successfully (if not already running)
cd packages/backend && timeout 5 npm start
# Check for error output
```

### 7. Report Validation Results

Provide a clear report for each criterion:

**Format:**
```
## Validation Report for Step {step-number}

### Success Criteria Status

1. ✅ [Criterion 1 description]
   - Verified: [how you checked]
   - Status: Met

2. ❌ [Criterion 2 description]
   - Verified: [how you checked]
   - Status: NOT MET
   - Issue: [what's missing or wrong]
   - Fix: [specific guidance on what to do]

3. ✅ [Criterion 3 description]
   - Verified: [how you checked]
   - Status: Met

### Overall Status: [X/Y criteria met]

[If all criteria met:]
✅ All success criteria met! Ready to proceed.

Next steps:
1. Run: /commit-and-push <branch-name>
2. Move to next step

[If criteria not met:]
❌ Some criteria not met. Address the issues above before proceeding.

Next steps:
1. Fix the issues listed above
2. Re-run: /validate-step {step-number}
```

### 8. Provide Actionable Guidance

For any unmet criteria:
- **Be specific** about what's missing
- **Show exact commands** to verify the fix
- **Link to relevant files** if applicable
- **Suggest next actions** clearly

## Workflow Context

This prompt uses knowledge from:
- **Workflow Utilities** section in copilot-instructions.md (gh CLI commands)
- **Testing Scope** section in copilot-instructions.md (how to run different test types)
- **Code Quality Workflow** section in copilot-instructions.md (systematic validation)

## Agent Context

This prompt automatically switches to the `code-reviewer` agent, which:
- Systematically analyzes code quality
- Validates against requirements
- Provides clear, actionable feedback
- Identifies gaps and suggests fixes

## Example Flow

```
User runs: /validate-step 5-1

Finding exercise issue...
✓ Found issue #5: "Exercise: Build TODO API"

Locating Step 5-1...
✓ Found: "Step 5-1: Add POST endpoint for creating todos"

Extracting success criteria...
Found 4 criteria:
1. POST /api/todos endpoint exists
2. Request body includes text field
3. Tests pass for endpoint
4. No lint errors

Validating each criterion...

## Validation Report for Step 5-1

### Success Criteria Status

1. ✅ POST /api/todos endpoint exists
   - Verified: grep in packages/backend/src/app.js
   - Status: Met

2. ✅ Request body includes text field
   - Verified: Code review shows req.body.text handling
   - Status: Met

3. ❌ Tests pass for endpoint
   - Verified: npm test in packages/backend
   - Status: NOT MET
   - Issue: 1 test failing - "should return 201 for valid todo"
   - Fix: Check test expects correct status code (201 vs 200)

4. ✅ No lint errors
   - Verified: npm run lint in packages/backend
   - Status: Met

### Overall Status: 3/4 criteria met

❌ Some criteria not met. Address the issues above before proceeding.

Next steps:
1. Fix the failing test in app.test.js
2. Re-run: /validate-step 5-1
```

## Notes

- Step number is REQUIRED - cannot validate without it
- This prompt focuses on VERIFICATION, not implementation
- Provide specific, actionable feedback for any gaps
- Reference exact files and line numbers when possible
- If all criteria met, guide user to commit and proceed
