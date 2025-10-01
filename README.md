# CPHVA Connect

A conference management application for CPHVA (California Public Health Veterinary Association).

## About

CPHVA Connect is a comprehensive conference management platform built with Next.js, featuring:

- **User Management**: Registration, authentication, and role-based access
- **Event Management**: Schedule creation, speaker management, and location tracking
- **Attendee Features**: QR code tickets, check-in system, and interactive polls
- **Admin Dashboard**: Complete conference administration tools
- **Real-time Updates**: Live polling and notifications

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, SQLite database
- **UI Components**: Radix UI, Lucide React icons
- **Deployment**: Docker, Nginx, Linode

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nathanjdarby/cphvaconnect.git
   cd cphvaconnect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   cd database
   ./setup.sh
   cd ..
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Deployment

For production deployment to Linode, see the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) file.

## Features

### For Attendees
- User registration and profile management
- Digital ticket with QR code
- Event schedule and speaker information
- Interactive polls and Q&A
- Real-time updates

### For Administrators
- User and role management
- Event and schedule creation
- Speaker and exhibitor management
- Attendance tracking
- Poll creation and management
- Sales and reporting dashboard

### For Exhibitors
- Booth management
- Attendee interaction tracking
- Lead generation tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in this repository.
