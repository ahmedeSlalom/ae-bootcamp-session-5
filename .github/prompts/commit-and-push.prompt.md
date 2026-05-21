---
description: "Analyze changes, generate commit message, and push to feature branch"
tools: ['read', 'execute', 'todo']
---

# Commit and Push Changes

Analyze current changes, generate a descriptive commit message using conventional commit format, and push to a feature branch.

## User Input

**Branch Name** (REQUIRED): ${input:branch-name:Enter the feature branch name (e.g., feature/add-todo-endpoint)}

## Pre-Commit Validation

### Check UI Test Requirements

If the current step includes UI testing workflow requirements:
1. Verify that UI tests have been run successfully with `/run-ui-tests`
2. OR manually run: `cd packages/frontend && npm run test:ui`
3. Ensure UI tests are passing before proceeding with commit

**If UI tests are required but haven't been run:**
- Stop and instruct user to run `/run-ui-tests` first
- Do not proceed with commit until UI tests pass

## Instructions

### 1. Analyze Current Changes

View all changes made:

```bash
# Show detailed diff of all changes
git status
git diff
```

Review the changes and understand:
- What files were modified
- What functionality was added/changed/removed
- Whether this is a feature, fix, chore, etc.

### 2. Generate Conventional Commit Message

Based on the changes, generate a commit message following conventional commit format:

**Format**: `<type>: <description>`

**Types** (from Git Workflow in [.github/copilot-instructions.md](../copilot-instructions.md)):
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding or updating tests
- `refactor:` - Code restructuring without behavior change
- `chore:` - Maintenance tasks (dependencies, config)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, whitespace)

**Description**:
- Clear and concise (50 chars or less preferred)
- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end

**Examples**:
```
feat: add POST /api/todos endpoint
fix: resolve duplicate todo creation bug
test: add integration tests for todo API
refactor: extract todo validation logic
chore: update express dependency
```

### 3. Create or Switch to Feature Branch

**If branch name is not provided**, stop and ask the user:
```
Please provide a feature branch name. Examples:
- feature/add-todo-endpoint
- feature/implement-delete
- fix/todo-duplication
```

**If branch name is provided:**

```bash
# Try to switch to the branch
git checkout <branch-name> 2>/dev/null

# If branch doesn't exist, create it
if [ $? -ne 0 ]; then
  git checkout -b <branch-name>
fi
```

**Verify you're on the correct branch:**
```bash
git branch --show-current
```

**CRITICAL**: 
- **NEVER commit to `main` branch**
- **ONLY use the user-provided branch name**
- If accidentally on main, switch to feature branch immediately

### 4. Stage All Changes

```bash
# Stage all modified, new, and deleted files
git add .
```

Verify staged changes:
```bash
git status
```

### 5. Commit with Generated Message

```bash
git commit -m "<generated-commit-message>"
```

**Example**:
```bash
git commit -m "feat: add POST /api/todos endpoint"
```

### 6. Push to Feature Branch

```bash
# Push to the feature branch on remote
git push origin <branch-name>
```

**If this is the first push to this branch:**
```bash
# Set upstream tracking
git push -u origin <branch-name>
```

### 7. Confirm Success

Report the results:

```
✅ Commit and Push Successful

Branch: <branch-name>
Commit: <commit-message>
Changes: <number> files changed

Remote: https://github.com/<owner>/<repo>/tree/<branch-name>
```

## Workflow Context

This prompt uses knowledge from:
- **Git Workflow** section in copilot-instructions.md (conventional commits, branch strategy)
- **Testing Scope** section in copilot-instructions.md (when to require UI tests)

## Safety Checks

Before committing, verify:
- ✅ All tests pass (unit, integration, and UI if required)
- ✅ No lint errors (or lint errors are intentionally deferred)
- ✅ Changes align with the step requirements
- ✅ On correct feature branch (NOT main)

**If any check fails:**
- Stop and report the issue
- Provide guidance on how to fix
- Do not proceed with commit

## Example Flow

```
User runs: /commit-and-push
Bot: Enter branch name: feature/add-todo-creation

Analyzing changes...
- Modified: packages/backend/src/app.js
- Modified: packages/backend/__tests__/app.test.js
- Files changed: 2

Generated commit message: "feat: add POST /api/todos endpoint"

Creating feature branch...
✓ Branch created: feature/add-todo-creation

Staging changes...
✓ Staged 2 files

Committing...
✓ Committed with message: "feat: add POST /api/todos endpoint"

Pushing to remote...
✓ Pushed to origin/feature/add-todo-creation

✅ Commit and Push Successful

Branch: feature/add-todo-creation
Commit: feat: add POST /api/todos endpoint
Changes: 2 files changed

Remote: https://github.com/user/repo/tree/feature/add-todo-creation

Next: Create a pull request or continue with the next step
```

## Common Issues

**Issue**: Accidentally on main branch
```bash
# Solution: Switch to feature branch first
git checkout -b <feature-branch-name>
```

**Issue**: Branch already exists with different changes
```bash
# Check current branch
git branch --show-current

# If on wrong branch, switch to correct one
git checkout <correct-branch-name>
```

**Issue**: Merge conflicts
```bash
# Pull latest changes first
git pull origin main
# Resolve conflicts, then stage and commit
```

## Notes

- Always provide a descriptive branch name
- Follow conventional commit format strictly
- Never commit directly to main
- Ensure tests pass before committing
- This prompt works in any agent context (doesn't force agent switch)
