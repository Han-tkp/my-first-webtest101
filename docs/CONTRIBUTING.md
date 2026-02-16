# Contributing Guide

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature
4. Make your changes
5. Run tests and linting
6. Submit a pull request

## Development Workflow

### Before Starting

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript

- All code must be type-safe
- Use strict mode
- Avoid `any` types
- Define interfaces for data structures

### Testing

Write tests for:
- Utility functions
- React hooks
- API endpoints
- Critical business logic

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

## Commit Guidelines

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

Examples:
```
feat: add equipment search filter
fix: resolve login redirect issue
docs: update API documentation
test: add tests for useAuth hook
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Code Review

Reviewers will check:
- Code quality and readability
- Test coverage
- Documentation
- Performance implications
- Security considerations

## Questions?

Open an issue or contact the maintainers.
