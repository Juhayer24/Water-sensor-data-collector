# Research Project: Setup & Usage Guide

Welcome! This guide will walk you through setting up and running the research project. Please follow each step carefully. If you get stuck, ask for help.

---

## Table of Contents
1. [Requirements](#requirements)
2. [Project Structure](#project-structure)
3. [Initial Setup](#initial-setup)
4. [Running the Backend (Python)](#running-the-backend-python)
5. [Running the Frontend (React)](#running-the-frontend-react)
6. [Accessing the Application](#accessing-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Requirements
- **macOS** (or Linux/Windows with minor adjustments)
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Git** (optional, for version control)

---

## Project Structure
- `research-backend/` — Python backend (API server)
- `src/` — React frontend (user interface)
- `public/` — Static files for frontend
- `requirements.txt` — Python dependencies
- `package.json` — Node.js dependencies

---

## Initial Setup

### 1. Open Terminal
- Press `Cmd + Space`, type `Terminal`, and press `Enter`.

### 2. Navigate to the Project Folder
Replace `/path/to/research-main` with the actual path if different.
```sh
cd ~/Downloads/research-main
```

### 3. Install Python Dependencies
```sh
cd research-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Install Node.js Dependencies
Open a **new terminal tab** (press `Cmd + T`), then:
```sh
cd ~/Downloads/research-main
npm install
```

---

## Running the Backend (Python)
1. In the terminal (with the virtual environment activated):
```sh
cd research-backend
source venv/bin/activate
python app.py
```
- The backend server should start, usually on `http://127.0.0.1:5000` or similar.

---

## Running the Frontend (React)
1. In a **new terminal tab**:
```sh
cd ~/Downloads/research-main
npm start
```
- This will start the React app, usually on `http://localhost:3000`.

---

## Accessing the Application
- Open your web browser (Safari, Chrome, etc.).
- Go to: [http://localhost:3000](http://localhost:3000)
- You should see the application homepage.

---

## Troubleshooting
- **If you see errors about missing packages:**
  - For Python: Run `pip install -r requirements.txt` again.
  - For Node.js: Run `npm install` again.
- **If a port is already in use:**
  - Try closing other apps or restarting your computer.
- **If you see `ModuleNotFoundError` in Python:**
  - Make sure you activated the virtual environment: `source venv/bin/activate`
- **If you see `command not found: npm` or `node`:**
  - Install Node.js from [https://nodejs.org/](https://nodejs.org/)
- **If you see `command not found: python3`:**
  - Install Python 3 from [https://www.python.org/downloads/](https://www.python.org/downloads/)

---

## Additional Notes
- Always keep the backend and frontend running in separate terminal tabs.
- To stop a running server, press `Ctrl + C` in the terminal.
- If you make code changes, restart the affected server (backend or frontend).



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
