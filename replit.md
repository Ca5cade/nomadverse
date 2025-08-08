# Robot Programming IDE

## Overview

A comprehensive web-based integrated development environment (IDE) for visual robot programming. The application provides a drag-and-drop block-based programming interface that generates Python code for robot control, combined with a 3D simulation environment. Users can create, edit, and test robot programs through visual blocks, view the generated Python code, and simulate robot behavior in a 3D environment.

## Recent Updates (January 2025)

**Enhanced IDE Features:**
- ✅ Auto-save functionality for visual blocks and generated Python code
- ✅ Enhanced syntax highlighting with line numbers in code editor
- ✅ Toggle between read-only and editable code editor modes
- ✅ Built-in test runner with automated test case execution
- ✅ Improved block palette with better visual icons
- ✅ Enhanced simulation controls with speed adjustment
- ✅ Project creation functionality with toast notifications
- ✅ Better console panel with export and clear options
- ✅ Responsive toolbar with save, export, and test buttons

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Radix UI primitives with shadcn/ui component system for consistent, accessible components
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Development Setup**: TSX for TypeScript execution in development
- **API Design**: RESTful endpoints for project and file management operations
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development and interface for future database integration

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless connection
- **Schema**: Well-defined database schema for projects and files with JSON fields for flexible data storage
- **Migrations**: Drizzle Kit for database schema management and migrations

### IDE Components
- **Visual Programming**: Drag-and-drop block system with categorized blocks (motion, control, sensing, events)
- **Code Generation**: Automatic Python code generation from visual blocks with real-time updates
- **Code Editor**: Enhanced Python editor with syntax highlighting, line numbers, and editable/read-only modes
- **3D Simulation**: Three.js integration for robot simulation with speed controls and real-time stats
- **Test Runner**: Automated testing framework with individual and batch test execution
- **Project Management**: File explorer with project creation, organization, and management capabilities
- **Multi-tab Interface**: Separate views for visual programming, Python code editing, and 3D simulation
- **Console System**: Comprehensive logging with export functionality and problem detection

### Authentication and Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Development Mode**: Simplified authentication for development environment

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for Neon Database
- **drizzle-orm** and **drizzle-zod**: Type-safe ORM with Zod schema validation
- **express**: Web application framework for the Node.js backend
- **three**: 3D graphics library for robot simulation and visualization

### UI and Component Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **class-variance-authority**: Utility for managing CSS class variants
- **tailwindcss**: Utility-first CSS framework with custom configuration

### Development and Build Tools
- **vite**: Fast build tool with Hot Module Replacement
- **typescript**: Static type checking for enhanced development experience
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development environment integration

### Programming and Simulation
- **react-hook-form** with **@hookform/resolvers**: Form handling and validation
- **embla-carousel-react**: Carousel component for UI elements
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation for components and entities