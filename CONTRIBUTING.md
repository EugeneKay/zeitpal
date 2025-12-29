# Contributing to ZeitPal

First off, thank you for considering contributing to ZeitPal! It's people like you that make ZeitPal such a great tool.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the expected behavior**
- **Include your environment** (OS, browser, Node.js version)

### Suggesting Features

Feature suggestions are tracked as GitHub issues. When creating a feature request:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain why this feature would be useful**
- **Include mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Add tests** for any new functionality
4. **Ensure the test suite passes**: `pnpm run lint && pnpm run typecheck`
5. **Update documentation** as needed
6. **Write a clear commit message**

## Development Setup

### Prerequisites

- Node.js 18.x or later
- Docker (for local Supabase)
- pnpm

### Getting Started

```bash
# Clone your fork
git clone https://github.com/your-username/zeitpal.git
cd zeitpal

# Install dependencies
pnpm install

# Start Supabase
pnpm run supabase:web:start

# Start development server
pnpm run dev
```

### Project Structure

```
apps/web/          # Next.js application
packages/ui/       # Shared UI components
packages/features/ # Core feature packages
```

### Code Style

- We use **ESLint** and **Prettier** for code formatting
- Run `pnpm run format:fix` before committing
- Follow existing patterns in the codebase
- Use TypeScript for type safety

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues and pull requests when relevant

### Testing

```bash
# Run linting
pnpm run lint

# Run type checking
pnpm run typecheck

# Run tests
pnpm run test
```

## First-Time Contributors

New to open source? Look for issues labeled `good first issue` — these are specifically chosen to be approachable for newcomers.

## Questions?

Feel free to open a discussion on GitHub or reach out to the maintainers.

Thank you for contributing!
