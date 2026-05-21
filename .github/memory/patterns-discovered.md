# Code Patterns Discovered

This file documents recurring code patterns, solutions, and conventions discovered during development. Use these patterns to maintain consistency and avoid common pitfalls.

## Pattern Template

```markdown
### Pattern Name

**Context**: When and where this pattern applies

**Problem**: What problem does this pattern solve?

**Solution**: How to implement this pattern

**Example**:
```language
// Code example showing the pattern
```

**Related Files**: Links to files using this pattern

**Notes**: Additional considerations or trade-offs
```

---

## Patterns

### Service Initialization: Empty Array vs Null

**Context**: Initializing service data structures in Express API endpoints and React components

**Problem**: Inconsistent handling of empty vs uninitialized states leads to:
- Type errors when mapping over undefined values
- Unnecessary null checks throughout codebase
- Confusion about whether data is "not loaded yet" vs "loaded and empty"

**Solution**: Use empty arrays for list initialization, not null/undefined
- **Backend**: Initialize collections as empty arrays in service layer
- **Frontend**: Initialize state with empty arrays, not null
- **Rationale**: Enables consistent array method usage without defensive checks

**Example**:
```javascript
// ✅ GOOD: Initialize with empty array
class TodoService {
  constructor() {
    this.todos = []; // Ready for array operations immediately
  }
  
  getAllTodos() {
    return this.todos; // Always returns array
  }
}

// Frontend component
const [todos, setTodos] = useState([]); // Not useState(null)

// Can safely use array methods
todos.map(todo => <TodoItem key={todo.id} todo={todo} />)

// ❌ BAD: Initialize with null
class TodoService {
  constructor() {
    this.todos = null; // Requires null checks everywhere
  }
  
  getAllTodos() {
    return this.todos || []; // Defensive coding needed
  }
}

const [todos, setTodos] = useState(null);
// Requires: todos?.map() or todos && todos.map()
```

**Related Files**: 
- Backend: `packages/backend/src/app.js` (TodoService initialization)
- Frontend: `packages/frontend/src/App.js` (useState initialization)

**Notes**: 
- Exception: When null/undefined specifically means "not yet loaded" vs "loaded and empty"
- In such cases, use three states: null (not loaded), [] (loaded but empty), [items] (loaded with data)
- Document the distinction clearly in code comments
