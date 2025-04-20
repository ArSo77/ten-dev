# Tendev - FPV Race Communication

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
Tendev - FPV Race Communication is a cutting-edge web application designed to facilitate real-time, individual communications during FPV racing events. The application serves two primary user roles:

- **Race Director:** Can send urgent text messages to one or multiple pilots through an intuitive interface, manage pilot accounts, and view a comprehensive list of pilots with clear visual indicators.
- **Pilot:** Can log in to the system and view up-to-date notifications, with the latest 5 messages displayed in descending order (newest first).

The system continuously polls the database every 5 seconds to ensure timely delivery of messages, enabling seamless and efficient communication during competitive events.

## Tech Stack

**Frontend:**
- Vue 3
- TypeScript 5
- Tailwind CSS 4
- Shadcn/vue

**Backend:**
- Supabase (PostgreSQL and authentication)
- OpenRouter.ai for AI-powered integrations

**CI/CD and Deployment:**
- GitHub Actions for continuous integration and deployment
- DigitalOcean (Docker based deployment)

## Getting Started Locally
To set up the project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tendev.git
   cd tendev
   ```

2. **Use the correct Node.js version:**
   Ensure you are using the Node version specified in the `.nvmrc` file:
   ```bash
   nvm use
   ```

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts
In the project directory, you can run:

- **`dev`**: Starts the development server.
- **`build`**: Builds the project for production.
- **`lint`**: Lints the codebase to ensure code quality and adherence to style guidelines.
- **`test`**: Runs the test suite (if applicable).

## Project Scope
The scope of Tendev - FPV Race Communication includes:

- A responsive and dynamic web interface for real-time communication during FPV racing events.
- A comprehensive Race Director panel for managing pilots, composing messages, and sending alerts.
- A Pilot panel that displays up-to-date notifications, limited to the 5 most recent messages.
- Robust backend support with Supabase for data management and authentication.
- AI integration through OpenRouter.ai to enhance functionality.
- Continuous monitoring with periodic (every 5 seconds) database polling to ensure timely message delivery.

## Project Status
The project is currently under active development. New features and enhancements are continuously being implemented to improve performance and user experience.

## License
This project is licensed under the MIT License.
