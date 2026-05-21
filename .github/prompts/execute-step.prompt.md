---
description: "Execute instructions from the current GitHub Issue step"
agent: "tdd-developer"
tools: ['search', 'read', 'edit', 'execute', 'web', 'todo']
---

# Execute Step from GitHub Issue

Execute the instructions from the current step in the exercise GitHub Issue.

## User Input

**Issue Number** (optional): ${input:issue-number:Enter issue number (or leave blank to auto-detect)}

## Instructions

### 1. Find the Exercise Issue

If issue number is not provided, use GitHub CLI to find it:

```bash
# The main exercise issue has "Exercise:" in the title
gh issue list --state open --search "Exercise:"
```

Get the issue number from the results.

### 2. Retrieve Issue Content and Comments

```bash
# Get the full issue with all comments
gh issue view <issue-number> --comments
```

### 3. Parse the Latest Step Instructions

Look through the issue content and comments to find the most recent step that needs execution.

Steps are formatted as:
```
# Step X-Y: [Step Title]
...
:keyboard: Activity: [Activity Title]
- Instruction 1
- Instruction 2
...
```

Identify all `:keyboard: Activity:` sections in the current step.

### 4. Execute Each Activity Systematically

For each activity in the step:

1. **Read the instructions carefully**
2. **Execute each instruction sequentially**
3. **Use TDD approach**: Write tests first, then implement (RED-GREEN-REFACTOR)
4. **Verify each change** works before moving to the next instruction
5. **Track progress** using the todo tool

**CRITICAL SCOPE BOUNDARY:**
- **DO NOT create or run Playwright UI tests in this prompt**
- **DO NOT run `npm run test:ui`**
- UI testing has its own dedicated workflow prompts

**If the step requires UI test work:**
- Stop after completing non-UI activities
- Inform user that UI workflow is required next
- Direct user to run `/create-ui-tests` followed by `/run-ui-tests`

### 5. Testing During Execution

**Run appropriate tests for the changes you make:**

**Backend changes:**
```bash
cd packages/backend && npm test
```

**Frontend component changes:**
```bash
cd packages/frontend && npm test
```

**DO NOT run UI tests** - those are handled by separate prompts.

### 6. Do NOT Commit or Push

**IMPORTANT**: Do NOT commit or push changes. That is handled by the `/commit-and-push` prompt.

### 7. Report Completion and Next Steps

After completing all activities, provide a clear summary:

**Summary:**
- ✅ Completed: [list of completed activities]
- 📝 Changes made: [summary of changes]
- 🧪 Tests status: [all passing/some failing]

**Next Steps:**

Determine the appropriate next command based on the step requirements:

**If the step requires UI test workflow:**
```
1. Run: /create-ui-tests
2. Then: /run-ui-tests
3. Finally: /validate-step {step-number}
```

**If NO UI test workflow is required:**
```
1. Run: /validate-step {step-number}
```

**IMPORTANT**: 
- Never recommend `/validate-step` before completing required UI test prompts
- Always check if the step mentions UI tests, Playwright, or end-to-end testing
- Follow the testing scope constraints from project instructions

## Testing Scope Constraints

Reference the "Testing Scope" section in [.github/copilot-instructions.md](../copilot-instructions.md):

- **Backend**: Jest + Supertest (run in this prompt)
- **Frontend**: React Testing Library (run in this prompt)
- **UI Journeys**: Playwright (use `/create-ui-tests` and `/run-ui-tests` prompts)

## Workflow Context

This prompt uses knowledge from:
- **Workflow Utilities** section in copilot-instructions.md (gh CLI commands)
- **Testing Scope** section in copilot-instructions.md (what to test when)
- **Development Principles** section in copilot-instructions.md (TDD approach)

## Agent Context

This prompt automatically switches to the `tdd-developer` agent, which:
- Follows Red-Green-Refactor TDD cycles
- Writes tests FIRST, then implements
- Makes incremental, verifiable changes
- Does NOT create Playwright UI tests (uses `test-engineer` for that)

## Example Flow

```
User runs: /execute-step
Bot: Found exercise issue #5
Bot: Parsing Step 5-1: Add todo creation endpoint
Bot: Found 2 activities to execute

Activity 1: Create API endpoint for POST /api/todos
- Writing test first (RED)
- Running tests: FAIL (expected)
- Implementing endpoint (GREEN)
- Running tests: PASS
- Refactoring

Activity 2: Add request validation
- Writing validation tests (RED)
- Running tests: FAIL (expected)
- Implementing validation (GREEN)
- Running tests: PASS

Summary:
✅ Completed: API endpoint, validation
📝 Changes: app.js, app.test.js
🧪 Tests: All passing (8 tests)

Next Steps:
This step requires UI testing workflow.
1. Run: /create-ui-tests
2. Then: /run-ui-tests
3. Finally: /validate-step 5-1
```

## Notes

- This prompt focuses on IMPLEMENTATION using TDD
- It does NOT handle Playwright UI test creation or execution
- It does NOT commit or push changes
- Use dedicated prompts for UI tests and git operations
- Always complete the full TDD cycle for each change
