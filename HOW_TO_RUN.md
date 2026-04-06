# Running the Uniclub Application

When starting from fresh, you can use the commands below to run both the frontend and the backend development servers.

### 1. Start the Frontend
The frontend is a Vite + React application. Walk into the `frontend` folder and run the development server:

```powershell
cd frontend
npm run dev
```
> **Link:**  [http://localhost:5173/](http://localhost:5173/)

### 2. Start the Backend
The backend is a Spring Boot application. Open a new terminal tab, walk into the `backend` folder, and run:

```powershell
cd backend
.\mvnw spring-boot:run
```
> **Link:** [http://localhost:8080/](http://localhost:8080/) (Default Spring Boot port, used for API endpoints)

### 💡 Subagent / Workflow Integration
If you want me (the AI) to automatically run these for you in the future without detailed commands, I have also created a quick workflow! Just ask me to **"run the servers"** and I will handle it automatically.
