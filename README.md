# Visual Code Debugger

Visual Code Debugger is a powerful, AI-driven tool designed to help developers (especially beginners) understand code execution through visualization and AI-powered explanations. It transforms raw code into interactive flowcharts and provides step-by-step logical breakdowns.

## 🚀 Features

- **AI-Powered Flowcharts**: Automatically generate logical flowcharts from your code snippets using Google Gemini AI.
- **Interactive Code Editor**: Write and edit code in Java, Python, JavaScript, C, and C++ with a professional-grade editor.
- **Natural Language Explanations**: Get clear, beginner-friendly explanations of what your code does, powered by AI.
- **Call Stack Visualization**: See the inferred execution order of your functions.
- **Authentication**: Secure login via Amazon Cognito or explore as a Guest.
- **Session History**: Keep track of your previous debugging sessions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: React Flow
- **Editor**: Monaco Editor (@monaco-editor/react)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Auth**: AWS Cognito
- **Database**: MySQL (mysql2)
- **Session Management**: express-session

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Mudita-Singh/visual_debugger.git
cd visual_debugger
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
REDIRECT_URI=your_redirect_uri
```
Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Start the frontend:
```bash
npm run dev
```

## 🖥️ Usage

1. Open the application in your browser (usually `http://localhost:5173`).
2. Login or click **Continue as Guest**.
3. Select your programming language.
4. Paste your code into the editor.
5. Click **Run Code** to generate the flowchart and AI explanation.

## 📄 License
This project is licensed under the ISC License.
