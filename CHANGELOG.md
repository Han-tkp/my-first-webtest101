# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive TypeScript type definitions in `src/types/`
- Custom React hooks (useAuth, useRealtime, useToast) in `src/hooks/`
- Utility functions for error handling and validation in `src/utils/`
- Constants and error codes in `src/constants/`
- Testing framework with Jest and React Testing Library
- PWA support with manifest and service worker configuration
- Code quality tools (ESLint, Prettier)
- Comprehensive documentation (README.md, ARCHITECTURE.md, CONTRIBUTING.md)
- Environment variable template (.env.example)
- Proper .gitignore configuration
- Test examples and configurations

### Changed
- Enabled TypeScript strict mode for better type safety
- Updated package.json with additional scripts and dependencies
- Enhanced metadata in layout.tsx for PWA support
- Improved next.config.mjs with PWA configuration

### Security
- Protected environment variables with .gitignore
- Created .env.example template for secure setup

## [0.1.0] - 2026-02-15

### Added
- Initial project setup with Next.js 14
- Supabase integration for auth and database
- Dashboard with role-based access control
- Equipment management system
- Borrow request workflow
- Repair request workflow
- Modern UI with Tailwind CSS and animations
- Real-time updates with Supabase subscriptions
- 3D effects with Three.js
- Thai language support
