# Claude Code Instructions

## Project Overview
This is a Next.js 15 monorepo using TypeScript, Cloudflare D1, and OpenNext for deployment.

## Code Style & Lint Rules

### TypeScript
- **Always type function parameters explicitly** - Never use implicit `any` types
- When using `.map()`, `.filter()`, `.forEach()` on database results, always type the callback parameter:
  ```typescript
  // Good
  result.results.map((row: { id: string; name: string }) => ({ ... }))

  // Bad - implicit any
  result.results.map((row) => ({ ... }))
  ```

### Unused Variables & Parameters
- **Prefix unused variables with underscore** `_` to satisfy lint rules:
  ```typescript
  // Good - unused parameter
  export async function GET(_request: NextRequest) { ... }

  // Good - unused destructured value
  const { used, unused: _unused } = data;

  // Bad
  export async function GET(request: NextRequest) { ... } // if request is unused
  ```

### React Hooks
- **useEffect dependencies**: If a function is defined inside a component and used in useEffect, either:
  1. Include it in the dependency array, OR
  2. Add `// eslint-disable-next-line react-hooks/exhaustive-deps` with a comment explaining why

- **useMemo/useCallback**: Don't include recreated arrays/objects in dependency arrays. Move static data outside the component:
  ```typescript
  // Good - static data outside component
  const CHART_DATA = [{ x: 1, y: 2 }];

  function MyComponent() {
    const total = useMemo(() => CHART_DATA.reduce(...), []);
  }

  // Bad - data recreated every render
  function MyComponent() {
    const chartData = [{ x: 1, y: 2 }];
    const total = useMemo(() => chartData.reduce(...), [chartData]); // warning
  }
  ```

### JSX/React
- **Escape special characters in JSX text**:
  ```typescript
  // Good
  <p>You&apos;re welcome</p>
  <p>&ldquo;Quote&rdquo;</p>

  // Bad
  <p>You're welcome</p>
  <p>"Quote"</p>
  ```

### Imports
- **Remove unused imports** - Don't leave imported symbols that aren't used
- **No require() in TypeScript** - Use ES imports. If require is necessary, add:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require('module');
  ```

### API Routes (Next.js)
- When a route handler parameter isn't used, prefix with underscore:
  ```typescript
  export async function GET(_request: NextRequest) { ... }
  ```

### Error Handling
- **Don't leave unused error variables**:
  ```typescript
  // Good
  } catch {
    toast.error('Something went wrong');
  }

  // Good - if error is used
  } catch (error) {
    console.error(error);
  }

  // Bad - error defined but not used
  } catch (error) {
    toast.error('Something went wrong');
  }
  ```

### Array Access
- **Handle potentially undefined array access**:
  ```typescript
  // Good
  const value = COLORS[0]?.value ?? '#default';

  // Bad - may be undefined
  const value = COLORS[0].value;
  ```

### String Methods
- **Handle potentially undefined split results**:
  ```typescript
  // Good
  const [year, month] = date.split('-');
  parseInt(year ?? '0');

  // Bad
  parseInt(year); // year could be undefined
  ```

## Build & Deployment
- `.open-next/` folder contains build artifacts - it's excluded from linting
- Run `pnpm lint` before committing to catch issues early
- Run `pnpm typecheck` to verify TypeScript types

## Package Versions
- Keep dependency versions consistent across the monorepo
- `manypkg check` runs as part of lint to verify version alignment
