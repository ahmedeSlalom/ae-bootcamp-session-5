# Memory System for TODO Application Development

## Purpose

This memory system tracks patterns, decisions, and lessons learned during development. It helps GitHub Copilot provide better context-aware suggestions by learning from your project's specific challenges and solutions.

## Memory Types

### Persistent Memory (.github/copilot-instructions.md)
Foundational principles and workflows that rarely change:
- Project architecture and tech stack
- Testing strategies (TDD approach)
- Development principles
- Agent usage guidelines
- Git workflow conventions

**When to update**: Only when fundamental project approaches change.

### Working Memory (.github/memory/)
Dynamic discoveries and patterns accumulated during development:
- Session summaries (historical record)
- Code patterns discovered
- Active session notes (ephemeral)

**When to update**: Continuously during development as you learn and discover.

## Directory Structure

```
.github/memory/
├── README.md                    # This file - explains the memory system
├── session-notes.md             # Historical session summaries (COMMITTED)
├── patterns-discovered.md       # Accumulated code patterns (COMMITTED)
└── scratch/
    ├── .gitignore              # Ignores all scratch files
    └── working-notes.md        # Active session notes (NOT COMMITTED)
```

## File Purposes

### session-notes.md (Committed)
**Purpose**: Historical record of completed development sessions

**Content**: Summary of what was accomplished, key findings, and outcomes

**When to update**: 
- At the end of each development session
- Summarize key findings from `scratch/working-notes.md`
- Document significant milestones and decisions

**Used by AI to**:
- Understand project evolution
- Avoid repeating past mistakes
- Reference previous solutions

### patterns-discovered.md (Committed)
**Purpose**: Catalog of recurring code patterns and solutions

**Content**: Documented patterns with context, problem, solution, and examples

**When to update**:
- When you discover a pattern that should be applied consistently
- When debugging reveals a common anti-pattern
- When establishing new coding conventions

**Used by AI to**:
- Apply consistent patterns in new code
- Suggest pattern-based solutions
- Maintain code consistency

### scratch/working-notes.md (NOT Committed)
**Purpose**: Active notes during current development session

**Content**: Current task, approach, findings, decisions, blockers, next steps

**When to update**:
- Throughout active development session
- After debugging discoveries
- When making architectural decisions
- During TDD cycles

**Used by AI to**:
- Provide immediate context for current work
- Track in-progress decisions
- Remember session-specific findings

**Important**: This is ephemeral! At session end, extract key insights into `session-notes.md`.

## Workflow Integration

### TDD Workflow
1. **Write test** → Document test approach in `working-notes.md`
2. **Fail** → Note failure reason in `working-notes.md`
3. **Implement** → Record implementation decisions
4. **Pass** → Document what made it work
5. **Refactor** → If you discover a pattern, add to `patterns-discovered.md`
6. **Session end** → Summarize key TDD learnings in `session-notes.md`

### Code Quality/Linting Workflow
1. **Run lint** → Note categories of errors in `working-notes.md`
2. **Fix systematically** → Document systematic approach
3. **Pattern emerges** → Add to `patterns-discovered.md` if reusable
4. **Session end** → Summarize linting lessons in `session-notes.md`

### Debugging Workflow
1. **Identify issue** → Document symptoms in `working-notes.md`
2. **Debug** → Track investigation steps and findings
3. **Root cause found** → Record root cause clearly
4. **Fix** → Document solution approach
5. **Pattern recognition** → Add to `patterns-discovered.md` if applicable
6. **Session end** → Summarize debugging insights in `session-notes.md`

### UI Testing Workflow
1. **Define journey** → Note test scenarios in `working-notes.md`
2. **Create tests** → Document test structure decisions
3. **Debug failures** → Track failure patterns and fixes
4. **Stable tests achieved** → Document selector strategies in `patterns-discovered.md`
5. **Session end** → Summarize UI testing learnings in `session-notes.md`

## How AI Uses Memory

### During Active Development
1. **Reads persistent instructions** (.github/copilot-instructions.md) for foundational approach
2. **Consults patterns-discovered.md** for established project patterns
3. **Reviews session-notes.md** for historical context
4. **Checks working-notes.md** for immediate session context
5. **Applies combined knowledge** to provide context-aware suggestions

### Pattern Application
When you write new code, AI will:
- Apply patterns from `patterns-discovered.md`
- Avoid anti-patterns documented in session notes
- Follow conventions established in historical sessions
- Reference working notes for current task context

### Learning Over Time
As sessions accumulate:
- AI builds understanding of project-specific challenges
- Suggestions become increasingly aligned with your codebase
- Repetitive mistakes are avoided through documented learnings
- Consistency improves across all development activities

## Best Practices

### 1. Keep Working Notes Active
- Update `scratch/working-notes.md` throughout your session
- Don't wait until the end - capture thoughts immediately
- Use it as a thinking tool, not just documentation

### 2. Extract Key Insights
- At session end, review `scratch/working-notes.md`
- Extract only significant findings for `session-notes.md`
- Not everything needs to be preserved - be selective

### 3. Document Patterns Early
- When you notice a pattern twice, document it
- Include concrete examples with file references
- Make patterns actionable for future work

### 4. Keep It Concise
- Memory files should be scannable
- Use bullet points over paragraphs
- Link to code examples where possible

### 5. Update As You Go
- Don't let memory files become stale
- Update patterns when they evolve
- Remove outdated information

## Getting Started

1. **Before starting work**: Review `session-notes.md` and `patterns-discovered.md` for context
2. **During development**: Keep `scratch/working-notes.md` open and updated
3. **After completing work**: Summarize key findings in `session-notes.md`
4. **When patterns emerge**: Document in `patterns-discovered.md`
5. **Next session**: Repeat - AI will have growing context

## Example Usage Scenario

**Scenario**: Implementing a new TODO priority feature

```
1. Start session
   - Review session-notes.md for previous TODO feature work
   - Check patterns-discovered.md for API endpoint patterns
   - Open scratch/working-notes.md for active notes

2. During TDD cycle
   - Write test, note approach in working-notes.md
   - Test fails, document failure in working-notes.md
   - Implement feature, record decisions in working-notes.md
   - Test passes, note what worked

3. Pattern discovered
   - Notice validation pattern for TODO properties
   - Add to patterns-discovered.md with example

4. End session
   - Extract key findings from working-notes.md
   - Add summary to session-notes.md
   - Leave working-notes.md for next session or clean it
```

## Summary

This memory system creates a **learning feedback loop**:
- You document discoveries and patterns
- AI reads and applies this knowledge
- Suggestions become increasingly accurate
- Development becomes more efficient over time

Use it actively, keep it current, and watch AI assistance improve session after session.
