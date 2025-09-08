# GUVResumeAnalyser

Welcome to Career Analyser! This project is a web application designed to provide users with AI-powered tools to help them navigate their career path. The application focuses on generating personalized advice and analyzing professional documents to better prepare users for the job market.

## Key Features

* **AI Career Roadmap:** Generates a custom, 4-week actionable roadmap based on the user's profile, including their long-term goals, skills, and interests.
* **AI Resume Analyser:** Allows users to upload their resume (in `.txt` or `.pdf` format) and receive an in-depth analysis. The AI compares the resume against a target job description to provide a tailoring score and actionable suggestions for improvement.
* **User Profile Wizard:** A multi-step form that collects user information to personalize the AI-generated content.

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Component Library:** shadcn/ui
* **AI Integration:** A generative AI model accessed via its official API.
* **File Handling:** react-dropzone, pdf.js

## Getting Started

To get a local copy up and running, follow these steps.

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/GUVResumeAnalyser.git](https://github.com/your-username/GUVResumeAnalyser.git)
    cd GUVResumeAnalyser
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the post-install script (for PDF support):**
    ```sh
    npm run postinstall
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application will then be available at the local URL provided in your terminal.
