# AçaíControl - Point of Sale System

## Overview

AçaíControl is a modern point-of-sale (POS) system designed specifically for açaí businesses. It's built as a full-stack web application with a React frontend and Express backend, featuring comprehensive sales management, vendor tracking, inventory control, and financial reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom açaí-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with structured error handling
- **Validation**: Zod schemas shared between frontend and backend

### Development Setup
- **Monorepo Structure**: Single repository with client/, server/, and shared/ directories
- **Hot Reload**: Vite dev server with HMR for frontend, tsx for backend development
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### Database Schema
The system uses PostgreSQL with five main tables:
- **products**: Açaí products and flour types with pricing
- **vendors**: Sales representatives with commission rates
- **sales**: Transaction records with payment methods
- **sale_items**: Individual items within each sale
- **cash_flow_entries**: Financial tracking for income/expenses

Database is implemented using Drizzle ORM with Neon serverless PostgreSQL.

### Core Features
1. **Sales Management**: Point-of-sale interface with product selection, cart management, and payment processing
2. **Product Management**: CRUD operations for açaí products (500ml, 1000ml, custom volumes) and flour products
3. **Vendor Management**: Sales rep tracking with commission calculations
4. **Financial Reporting**: Daily stats, vendor performance, and cash flow analysis
5. **Settings Management**: Product pricing updates and system configuration

### UI/UX Design
- **Theme**: Brazilian açaí-inspired purple palette with Amazon green accents using standard Tailwind colors
- **Color System**: purple-* for açaí branding, green-* for success/nature elements, consistent across all components
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Component Library**: Consistent design system using shadcn/ui components
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

### Sales Process
1. Vendor selection from dropdown
2. Product selection from visual grid
3. Quantity input (automatic for standard sizes, manual for custom açaí)
4. Cart management with item additions/removals
5. Payment method selection
6. Transaction completion with automatic commission calculation

### Data Synchronization
- Frontend uses TanStack Query for optimistic updates and caching
- Real-time data invalidation on mutations
- Shared TypeScript types ensure type safety across the stack

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: Environment variable `DATABASE_URL` required
- **Migrations**: Drizzle Kit for schema management

### UI Components
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework

### Development Tools
- **Replit Integration**: Custom plugins for development environment
- **TypeScript**: Strict type checking across the entire codebase
- **ESLint/Prettier**: Code formatting and linting (implied by structure)

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Static Serving**: Express serves built frontend in production

### Environment Configuration
- **Development**: Separate dev servers for frontend (Vite) and backend (tsx)
- **Production**: Single Express server serving both API and static files
- **Database**: Neon connection string via environment variables

### Scaling Considerations
- Stateless server design enables horizontal scaling
- Database connection pooling through Neon's serverless architecture
- CDN-ready static asset serving for frontend resources

## Recent Changes

### Database Integration (January 2025)
- **Migration to PostgreSQL**: Successfully migrated from in-memory storage to PostgreSQL with Neon Database
- **Schema Implementation**: Created comprehensive Drizzle ORM schema with 5 tables and proper relations
- **Data Persistence**: All sales, products, vendors, and cash flow entries now persist between sessions
- **Color System Update**: Replaced custom CSS color variables with standard Tailwind colors for better maintainability

The architecture prioritizes developer experience with hot reloading, type safety, and modern tooling while maintaining simplicity for deployment and maintenance. The açaí business domain is well-modeled with appropriate abstractions for products, sales, and financial tracking.