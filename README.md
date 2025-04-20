# Tendev

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
Tendev is a cutting-edge web application that delivers a seamless and interactive user experience. Built with Vue 3 and TypeScript 5, it leverages modern technologies to ensure robust performance, scalability, and maintainability. The application integrates a dynamic frontend with a powerful backend, featuring Supabase for database and authentication, and utilizes AI capabilities through OpenRouter.ai to support a wide array of models and functionalities.

## Tech Stack
- **Frontend:**
  - Vue 3
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/vue

- **Backend:**
  - Supabase (PostgreSQL)
  - OpenRouter.ai for AI integration

- **CI/CD and Hosting:**
  - Github Actions for continuous integration and deployment
  - DigitalOcean for hosting via Docker images

## Getting Started Locally
Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tendev.git
   cd tendev
   ```

2. **Use the correct Node version:**
   Make sure you are using the Node version specified in the `.nvmrc` file:
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
   Then, open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts
In the project directory, you can run:

- **`dev`**: Starts the development server.
- **`build`**: Builds the project for production.
- **`lint`**: Lints the codebase for style and errors.
- **`test`**: Runs the test suite (if applicable).

Additional scripts may be defined in the `package.json` file.

## Project Scope
The scope of Tendev includes:

- A responsive and dynamic user interface built using Vue 3.
- Integration with Supabase for backend services such as authentication and data management.
- Utilization of OpenRouter.ai for advanced AI functionalities, enabling interactions with multiple AI models.
- Implementation of CI/CD pipelines using Github Actions to streamline development and deployment processes.
- A focus on scalability, maintainability, and best practices in both frontend and backend development.

## Project Status
The project is currently under active development. Features are continually being added and refined. Contributions, issue reports, and feedback are welcome.

## License
This project is licensed under the MIT License.
