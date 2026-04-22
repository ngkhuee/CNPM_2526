# Yummy FoodFast Delivery

A comprehensive online food delivery management system providing a complete platform for customers, restaurants, and administrators.

## Documentation Overview

Link to detailed documentation: [Yummy FoodFast Documentation](https://drive.google.com/drive/folders/1rBSe93HHLfBhJepa-yChwgjVHL9eYQJL?usp=sharing)

## Project Objective

Build a modern food delivery platform that supports multiple user roles with features for order management, payment processing, delivery tracking, and restaurant approval.

## System Architecture

The project is built using a **Monorepo** model with NPM Workspaces, enabling independent management of applications and shared libraries.

```
CNPM_2526/
├── apps/                           # Main applications
│   ├── admin-web/                  # Admin dashboard
│   ├── customer/                   # Customer application
│   │   ├── web/                    # Web version
│   │   ├── mobile/                 # Mobile version (React Native/Expo)
│   │   └── shared/                 # Shared code between web and mobile
│   └── restaurant-web/             # Restaurant dashboard
│
├── packages/                       # Shared libraries
│   ├── shared-constants/           # System-wide constants
│   ├── shared-contexts/            # Shared React Context
│   ├── shared-hooks/               # Reusable custom hooks
│   ├── shared-services/            # API services and business logic
│   ├── shared-styles/              # Global CSS/Styling
│   ├── shared-ui/                  # Reusable UI components
│   └── shared-utils/               # Utility functions
│
├── mock-backend/                   # Mock API with JSON Server
└── package.json                    # Root workspace configuration
```

## Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Application routing
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **React Icons** - Icon library
- **React Native/Expo** - Mobile app development

### Backend
- **Node.js** - Runtime environment
- **JSON Server** - RESTful Mock API
- **Express.js** - Web framework (integrated via middleware)
- **JWT** - Authentication
- **Multer** - File uploads
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variable management

### Tools & DevOps
- **NPM Workspaces** - Monorepo management
- **Nodemon** - Development server
- **Concurrently** - Run multiple processes simultaneously
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Key Features

### Customer
- Browse restaurant list
- Search and filter dishes by category
- Shopping cart management
- Place orders and track status
- Delivery location tracking (Geolocation)
- Rate restaurants and dishes
- Manage promotions and discount codes
- Stripe payment integration
- Order history

### Restaurant
- Manage menu and dishes
- View new orders
- Update order status
- Manage operating hours
- Revenue statistics
- Manage promotions

### Admin
- System-wide analytics dashboard
- Approve new restaurants
- User management
- Payment management
- Track delivery location (map view)
- Create and manage promotions
- Approve/reject drone delivery
- System statistics

## System Requirements

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Git**: For cloning repository

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd CNPM_2526
```

### 2. Install Dependencies
```bash
npm install
```
This command will automatically install dependencies for all workspaces (apps and packages).

### 3. Configure Environment Variables
Create a `.env` file in `mock-backend/` (if needed):
```env
PORT=3001
NODE_ENV=development
```

## Running the Project

### Run Entire System
```bash
npm run dev:all
```
This command will simultaneously start:
- Mock Backend (port 3001)
- Customer Web (port 5173)
- Restaurant Web (port 5174)
- Admin Web (port 5175)

### Run Applications Individually
```bash
# Customer Web
npm run dev:customer-web

# Restaurant Web
npm run dev:restaurant

# Admin Web
npm run dev:admin

# Mock Backend
npm run dev:mock
```

### Run Frontend Without Backend
```bash
npm run dev:frontend
```

## Build for Production

```bash
npm run build:all
```

Build files will be created in the `dist` folder of each app.

## Data Structure

### Database Schema (JSON Server)
Mock backend uses `mock-backend/db.json` with the following collections:

- **users** - User information (customer, restaurant, admin)
- **restaurants** - Restaurant information
- **foods** - List of dishes
- **orders** - Orders
- **payments** - Payment information
- **promotions** - Discount codes and promotions
- **categories** - Dish categories
- **ratings** - Restaurant and dish ratings
- **drones** - Drone delivery information

## API Endpoints

Mock backend provides RESTful endpoints:

- `GET/POST /users` - User management
- `GET/POST /restaurants` - Restaurant management
- `GET/POST /foods` - Dish management
- `GET/POST /orders` - Order management
- `GET/POST /payments` - Payment management
- `GET/POST /promotions` - Promotion management
- `GET /auth` - Authentication endpoints

## Project Conventions

### App Folder Structure
```
src/
├── components/      # React components
├── pages/           # Page components (Routes)
├── Context/         # React Context API
├── hooks/           # Custom hooks
├── assets/          # Images, fonts
├── utils/           # Utility functions
├── styles/          # CSS files
└── index.css        # Global styles
```

### Naming Conventions
- **Components**: PascalCase (e.g., `OrderCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useOrderManagement.js`)
- **Utilities**: camelCase (e.g., `formatters.js`)
- **Constants**: UPPER_SNAKE_CASE

### State Management
- React Context API for global state
- Custom hooks for reusable logic
- localStorage for persistent state

## Testing & Quality

### Code Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run prettier
```

## Performance Optimizations

- Code splitting with React lazy loading
- Image optimization
- Debouncing for search queries
- Component memoization
- Efficient re-renders

## Project Highlights

- **Monorepo Architecture** - Simplified code management, component and utility sharing
- **Multi-Platform** - Web and Mobile support from the same codebase
- **Role-Based Access** - 3 user roles with separate interfaces
- **Real-time Tracking** - Delivery location tracking with interactive maps
- **Payment Integration** - Stripe integration for secure payments
- **Scalable Architecture** - System design enables easy expansion

## Development Notes

### Environment Setup
- Use Node.js v16+
- Install Git for version control
- Recommended to use VS Code with ESLint extension

### Common Issues
- If a port is in use, change the port in `vite.config.js`
- Delete `node_modules` and `package-lock.json` if dependency issues occur
- Restart dev server if new packages are added

## Contact & Support

For bug reports or feature suggestions, please create an issue on the repository.

## License

MIT

---

**Version**: 1.0.0  
**Last Updated**: April 2026
