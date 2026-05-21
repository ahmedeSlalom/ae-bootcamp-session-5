# GitHub Copilot Instructions for TODO Application

## Project Context

This is a full-stack TODO application with:
- **Frontend**: React-based user interface
- **Backend**: Express REST API
- **Development approach**: Iterative, feedback-driven development
- **Current phase**: Backend stabilization and frontend feature completion

The project emphasizes test-driven development, incremental changes, and systematic validation to ensure quality at every stage.

## Documentation References

Consult these documents when working on the project:
- [docs/project-overview.md](../docs/project-overview.md) - Architecture, tech stack, and project structure
- [docs/testing-guidelines.md](../docs/testing-guidelines.md) - Test patterns and standards
- [docs/workflow-patterns.md](../docs/workflow-patterns.md) - Development workflow guidance

## Development Principles

Follow these core principles throughout development:

- **Test-Driven Development (TDD)**: Follow the Red-Green-Refactor cycle
  - Write failing tests first (Red)
  - Implement minimal code to pass (Green)
  - Improve code quality while maintaining tests (Refactor)

- **Incremental Changes**: Make small, testable modifications
  - Each change should be independently verifiable
  - Avoid large, multi-purpose commits

- **Systematic Debugging**: Use test failures as guides
  - Let tests drive the debugging process
  - Fix one issue at a time
  - Validate fixes with test runs

- **Validation Before Commit**: Ensure quality gates pass
  - All tests must pass
  - No lint errors
  - Code follows project conventions

## Testing Scope

This project uses a comprehensive testing strategy across multiple layers:

### Test Types

- **Backend Unit/Integration Tests**: Jest + Supertest for API testing
  - Test API endpoints, request/response validation
  - Database interactions and business logic
  - Run with: `npm test` (from backend directory)

- **Frontend Component Tests**: React Testing Library for component behavior
  - Component rendering and user interactions
  - State management and props handling
  - Run with: `npm test` (from frontend directory)

- **UI End-to-End Tests**: Playwright for critical user journeys
  - Full application flows from user perspective
  - Cross-browser validation
  - Run with: `npm run test:ui` (from frontend directory)

- **Manual Browser Testing**: Exploratory validation and visual checks
  - Visual design validation
  - UX flow verification
  - Edge case exploration

**Rationale**: Combine fast feedback from unit/integration tests with end-to-end quality confidence from UI tests.

### Testing Approach by Context

**Backend API Changes**:
1. Write Jest tests FIRST (RED)
2. Run tests to see them fail
3. Implement the feature (GREEN)
4. Refactor while keeping tests passing
5. This is true TDD: Test first, then code to pass the test

**Frontend Component Features**:
1. Write React Testing Library tests FIRST for component behavior (RED)
2. Run tests to see them fail
3. Implement the component (GREEN)
4. Refactor while keeping tests passing
5. Follow with manual browser testing for full UI flows
6. This is true TDD: Test first, then code to pass the test

**UI Critical Journeys**:
- Define critical user flows
- Create Playwright tests for automation
- Run tests to validate end-to-end behavior
- Debug failures systematically
- Maintain test coverage as features evolve

## Workflow Patterns

Follow these structured workflows for different development activities:

### 1. TDD Workflow (Red-Green-Refactor)
1. **Write/Fix Tests**: Create or update test cases first
2. **Run Tests**: Execute test suite and confirm failure
3. **Fail**: Verify test fails for the right reason
4. **Implement**: Write minimal code to pass the test
5. **Pass**: Verify test now passes
6. **Refactor**: Improve code quality while maintaining passing tests

### 2. Code Quality Workflow
1. **Run Lint**: Execute linter to identify issues
2. **Categorize Issues**: Group errors by type/file
3. **Fix Systematically**: Address issues one category at a time
4. **Re-validate**: Run lint again to confirm fixes

### 3. Integration Workflow
1. **Identify Issue**: Recognize integration problem or gap
2. **Debug**: Investigate root cause with logs/tests
3. **Test**: Create tests that reproduce the issue
4. **Fix**: Implement solution
5. **Verify End-to-End**: Validate complete flow works

### 4. UI Testing Workflow
1. **Define Critical Journeys**: Identify key user flows to automate
2. **Create UI Tests**: Write Playwright tests for those journeys
3. **Run Tests**: Execute UI test suite
4. **Debug Failures**: Systematically triage and fix issues
5. **Validate Coverage**: Ensure critical paths are protected

## Agent Usage

Use specialized agents for specific workflows:

### tdd-developer
- **Purpose**: Implementation and unit/integration TDD cycles
- **Responsibilities**:
  - Writing backend and frontend unit/integration tests
  - Implementing features using TDD approach
  - Refactoring existing code
  - Running Jest and React Testing Library tests
- **Restrictions**: Do NOT create or run Playwright UI tests in this mode

### code-reviewer
- **Purpose**: Code quality and lint error resolution
- **Responsibilities**:
  - Addressing ESLint/Prettier errors
  - Code quality improvements
  - Ensuring consistent code style
  - Reviewing code for best practices

### test-engineer
- **Purpose**: UI test automation with Playwright
- **Responsibilities**:
  - All Playwright UI test authoring and execution
  - Failure triage and root cause analysis
  - Test isolation verification
  - Test maintenance and stability improvements
- **Restrictions**: Owns the UI testing domain exclusively

## Memory System

Use the memory system to track patterns, decisions, and lessons learned during development:

- **Persistent Memory**: This file (`.github/copilot-instructions.md`) contains foundational principles and workflows
- **Working Memory**: `.github/memory/` directory contains discoveries and patterns
  - During active development, take notes in `.github/memory/scratch/working-notes.md` (not committed)
  - At end of session, summarize key findings into `.github/memory/session-notes.md` (committed)
  - Document recurring code patterns in `.github/memory/patterns-discovered.md` (committed)
- **Reference these files** when providing context-aware suggestions
- **See**: [.github/memory/README.md](memory/README.md) for detailed usage instructions

## Workflow Utilities

Use GitHub CLI commands for workflow automation (available to all agent modes):

### Issue Management
```bash
# List all open issues
gh issue list --state open

# View issue details
gh issue view <issue-number>

# View issue with comments
gh issue view <issue-number> --comments
```

### Exercise Workflow
- The main exercise issue will have "Exercise:" in the title
- Steps are posted as comments on the main issue
- Use these commands when `/execute-step` or `/validate-step` prompts are invoked

### Common Patterns
```bash
# Find the main exercise issue
gh issue list --state open --search "Exercise:"

# View the next step
gh issue view <issue-number> --comments
```

## Git Workflow

Follow these conventions for version control:

### Conventional Commits
Use conventional commit format for clear, semantic commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks (dependencies, config)
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code restructuring without behavior change
- `style:` - Code style changes (formatting, whitespace)

**Examples**:
```bash
git commit -m "feat: add delete button to todo items"
git commit -m "fix: resolve duplicate todo creation bug"
git commit -m "test: add integration tests for todo API"
```

### Branch Strategy
- **Feature branches**: `feature/<descriptive-name>`
- **Bug fix branches**: `fix/<descriptive-name>`
- **Main branch**: `main` (protected, always stable)

### Standard Git Operations
```bash
# Always stage all changes before committing
git add .

# Commit with conventional format
git commit -m "feat: <description>"

# Push to the correct branch
git push origin <branch-name>

# Create a new feature branch
git checkout -b feature/<name>
```

### Best Practices
- Keep commits atomic and focused
- Write clear, descriptive commit messages
- Always validate tests pass before pushing
- Push to feature branches, not directly to main
- Use pull requests for code review
