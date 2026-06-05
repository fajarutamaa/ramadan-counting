```markdown
# ramadan-counting Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `ramadan-counting` TypeScript repository. You'll learn about file naming, import/export styles, commit message conventions, and how to write and run tests in this codebase. This guide is ideal for contributors who want to maintain consistency and quality in their code contributions.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names.
  - Example: `RamadanCounter.ts`, `DateUtils.ts`

### Import Style
- **Alias imports** are preferred.
  - Example:
    ```typescript
    import { RamadanCounter } from '@components/RamadanCounter';
    ```

### Export Style
- **Named exports** are used instead of default exports.
  - Example:
    ```typescript
    // In RamadanCounter.ts
    export function RamadanCounter() { ... }
    ```

### Commit Messages
- **Conventional commits** are used, with clear type prefixes.
- Common prefix: `refactor`
- Example:
  ```
  refactor: update RamadanCounter logic for improved accuracy
  ```

## Workflows

### Refactoring Code
**Trigger:** When you need to improve code structure or readability without changing its behavior  
**Command:** `/refactor`

1. Identify the code section that needs improvement.
2. Refactor the code, ensuring no change in external behavior.
3. Use PascalCase for any new files.
4. Use alias imports and named exports as per conventions.
5. Write a commit message starting with `refactor:`.
6. Run tests to ensure nothing is broken.
7. Push your changes.

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `RamadanCounter.test.ts`).
- The testing framework is not specified, but tests should be colocated with the code or in a dedicated test directory.
- Example test file:
  ```typescript
  // RamadanCounter.test.ts
  import { RamadanCounter } from '@components/RamadanCounter';

  describe('RamadanCounter', () => {
    it('should count days correctly', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command    | Purpose                                      |
|------------|----------------------------------------------|
| /refactor  | Start a code refactoring workflow            |
```
