# Lemuel EduSpace Frontend

A modern Learning Management System (LMS) frontend built with React, designed to work with the Lemuel EduSpace backend.

## Features

- **User Authentication**: Login/Register with role-based access control
- **Role-based UI**: Different interfaces for Admin, Teacher, Student, Parent, and Student-Parent roles
- **Dashboard**: Personalized dashboard with upcoming sessions, notifications, and quick actions
- **Session Management**: View and manage learning sessions with file attachments
- **Class & Subject Management**: Organize educational content
- **Notification System**: Real-time notifications and announcements
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Profile Management**: User profile and settings management

## Tech Stack

- **React 19** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Vite** - Build tool and development server

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   ├── UI/             # UI components (Buttons, Modals, etc.)
│   └── ProtectedRoute.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx # Authentication context
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── Sessions.jsx
├── services/           # API service functions
│   ├── api.js          # Axios configuration
│   └── index.js        # All API services
├── utils/              # Utility functions and constants
│   └── index.js
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running Lemuel EduSpace Backend

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lemuel-eduspace-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend URL:
   - Open `src/services/api.js`
   - Update the `baseURL` to match your backend server (default: `http://localhost:8000/api/v1`)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## User Roles and Permissions

The application supports different user roles with specific permissions:

### Admin
- Full system access
- User management (CRUD operations)
- Class and subject management
- Session management
- Notification management
- System statistics and reporting

### Teacher
- Session management for assigned subjects
- Class management
- Student enrollment
- Notification creation
- Profile management

### Student
- View assigned classes and sessions
- Access session materials and attachments
- View notifications
- Profile management

### Parent
- View child's classes and sessions
- Access notifications
- Profile management

### Student & Parent
- Combined permissions of Student and Parent roles

## API Integration

The frontend communicates with the backend through RESTful APIs. All API calls are handled through service functions located in `src/services/`:

- **Authentication**: Login, register, logout
- **User Management**: Profile updates, user CRUD (admin)
- **Session Management**: Create, read, update, delete sessions
- **File Management**: Upload and download attachments
- **Notifications**: Create and manage notifications

## Authentication Flow

1. User logs in through the Login page
2. JWT token is stored in localStorage
3. Token is automatically included in API requests
4. Protected routes check for valid authentication
5. Role-based access control restricts certain features

## Styling

The application uses Tailwind CSS for styling:

- Responsive design principles
- Consistent color scheme
- Accessible UI components
- Dark/light mode support (future enhancement)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EduSpace
```

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure the backend server is running
   - Check the API base URL in `src/services/api.js`
   - Verify CORS settings on the backend

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check token expiration in browser dev tools

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript/ESLint errors

### Development Tips

- Use React Developer Tools for debugging
- Monitor network requests in browser dev tools
- Check console for error messages
- Use the debugging features in your IDE

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the backend repository

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
