# InnovateHubCEC

InnovateHubCEC is a dynamic platform designed for the students of Canara Engineering College (CEC). It serves as a central hub for students to showcase projects, share innovative ideas, and connect with peers and mentors across various technical domains. The platform fosters a culture of building and collaboration by providing tools for project visibility, skill-matching, and healthy competition through coding leaderboards.

## Live Demo

You can access the live application here: **[https://innovatehubcec.vercel.app/](https://innovatehubcec.vercel.app/)**

## ✨ Key Features

*   **Project Showcase:** Upload project details, descriptions, media (images/videos), and link to live demos and GitHub repositories.
*   **Peer Networking:** Follow other students, get notified of their activities, and build a professional network within the campus community.
*   **Real-time Chat:** Engage in discussions in public chat rooms (e.g., General, Projects) or have private one-on-one conversations with peers and mentors.
*   **Coding Leaderboards:** Stay motivated with an integrated leaderboard system that tracks and ranks GitHub contributions and LeetCode problem-solving stats.
*   **LinkedIn Integration:** Automatically fetch and display your latest LinkedIn posts on your feed to share professional updates with your network.
*   **Comprehensive User Profiles:** Create detailed profiles with skills, certifications, projects, achievements, and links to external profiles like GitHub, LinkedIn, and LeetCode.

## 🛠️ Tech Stack

### Backend
*   **Framework:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** JSON Web Tokens (JWT)
*   **Real-time Communication:** Socket.IO
*   **File Storage:** Cloudinary for media uploads
*   **Web Scraping:** Apify for LinkedIn post integration
*   **Scheduling:** node-cron for updating leaderboard stats

### Frontend
*   **Framework/Library:** React with Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API
*   **API Communication:** Axios
*   **Real-time Communication:** Socket.IO Client

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or higher)
*   npm (or yarn/pnpm)
*   MongoDB instance (local or Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/kaushik4141/InnovateHubCEC.git
    cd InnovateHubCEC
    ```

2.  **Set up the Backend:**
    ```sh
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add the necessary environment variables (see `.env.example` section below).
    ```sh
    npm run dev
    ```

3.  **Set up the Frontend:**
    ```sh
    cd ../frontend
    npm install
    npm run dev
    ```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy) and the backend server will run on the port specified in your `.env` file (e.g., 8000).

### Environment Variables

Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your actual credentials.

```env
# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:5173

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Apify Credentials (for LinkedIn Scraping)
APIFY_TOKEN=your_apify_token
APIFY_ACTOR_ID=your_apify_actor_id
APIFY_DATASET_ID=your_apify_dataset_id
```

## 📂 Project Structure

The repository is organized as a monorepo with two main directories:

*   `backend/`: Contains the Node.js/Express server.
    *   `src/controllers/`: Logic for handling API requests.
    *   `src/models/`: Mongoose schemas for the database.
    *   `src/routes/`: API endpoint definitions.
    *   `src/middlewares/`: Custom middleware for authentication and file uploads.
    *   `src/utils/`: Utility functions, including Cloudinary and schedulers.
    *   `socket.js`: Configuration for Socket.IO real-time communication.
*   `frontend/`: Contains the React/Vite client application.
    *   `src/components/`: Reusable React components.
    *   `src/pages/`: Main page components rendered by React Router.
    *   `src/services/`: Functions for making API calls to the backend.
    *   `src/context/`: React context providers, such as `ChatContext`.
