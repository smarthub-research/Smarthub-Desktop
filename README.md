# Smarthub Desktop

A cross-platform desktop application for device management, analytics, and more—built with Next.js, Electron, and Python FastAPI. 
This application is built in partnership with The Ohio State University Smarthub Research Group.

## Features

- Modern React/Next.js frontend with Tailwind CSS
- Electron desktop integration for native features
- Python FastAPI backend for authentication and database APIs
- Real-time data processing with Kafka integration
- Device connectivity (Bluetooth via @abandonware/noble)
- Analytics, calendar, bug reporting, and data visualization
- Supabase authentication integration
- Modular, extensible architecture

## Prerequisites

- **Node.js** (v18+ recommended) & npm
- **Python** 3.8+ & pip
- **Docker** & Docker Compose (for Kafka/Redpanda message streaming)
- **macOS/Linux/Windows** (platform-specific instructions below)

## Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Smarthub-Desktop
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Set Up Python Virtual Environment
Create and activate a virtual environment in the project root:

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 4. Install Python Backend Dependencies
With the virtual environment activated:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 5. Configure Environment Variables
Create a `.env` file in the project root with your configuration:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Kafka Configuration
KAFKA_BOOTSTRAP=localhost:9092
```

### 6. Start Kafka/Redpanda (Required for Message Processing)
The application uses Redpanda (Kafka-compatible) for real-time message streaming.

**First, ensure Docker Desktop is running** (or Docker Engine on Linux).

Then start the Redpanda container:
```bash
docker-compose up -d
```

This starts Redpanda on port 9092. Verify it's running:
```bash
docker ps
```

To stop Redpanda when you're done:
```bash
docker-compose down
```

## Running the Application

### Start Everything at Once (Recommended)
**Prerequisites:** 
1. Ensure **Docker Desktop is running**
2. Start Redpanda: `docker-compose up -d`

Run the complete application stack with a single command:
```bash
npm start
```

This command uses `concurrently` to start three services simultaneously:
1. **Next.js Frontend** - Runs on `http://localhost:3000` (with Turbopack)
2. **Electron Desktop App** - Waits for frontend, then launches the desktop window
3. **FastAPI Backend** - Runs on `http://localhost:8000` with Kafka integration

**Note:** The virtual environment must exist at `.venv/` for the backend to start correctly.

### Running Services Individually

If you need to run services separately for development:

**Frontend Only (Next.js):**
```bash
npm run dev
```

**Backend Only (FastAPI):**
```bash
npm run fastapi:start
```
Or manually:
```bash
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
cd backend
python -m main
```

**Electron Only:**
```bash
npm run electron:start
```
(Requires frontend to be running on port 3000)

**Kafka Message Processing (Standalone):**
```bash
npm run kafka:standalone
```
(Requires Redpanda to be running via `docker-compose up -d`)

## Project Structure

```
Smarthub-Desktop/
├── app/                    # Next.js pages and routes
│   ├── auth/              # Authentication pages
│   ├── calendar/          # Calendar feature
│   ├── calibration/       # Device calibration
│   ├── components/        # Page-specific components
│   ├── messages/          # Messaging features
│   ├── profile/           # User profile
│   ├── recorder/          # Data recording
│   ├── reviewer/          # Data review/analysis
│   └── settings/          # Application settings
├── backend/               # Python FastAPI backend
│   ├── routers/           # API route handlers
│   ├── services/          # Business logic and Kafka services
│   ├── supabase/          # Supabase client configuration
│   ├── utils/             # Utility functions
│   └── main.py            # FastAPI application entry point
├── electron/              # Electron desktop integration
│   ├── handlers/          # IPC handlers
│   ├── services/          # Native services (Bluetooth, file system)
│   ├── utils/             # Electron utilities
│   ├── main.js            # Electron main process
│   └── preload.js         # Preload scripts for renderer
├── public/                # Static assets
└── docs/                  # Documentation

```

## Testing

**Jest Tests (Frontend):**
```bash
npm run test:jest
```

**Pytest (Backend):**
```bash
npm run pytest
```

## Development Workflow

1. **Frontend Development**: Edit files in `app/` - changes hot-reload automatically
2. **Backend Development**: Edit files in `backend/` - restart the backend service to see changes
3. **Electron Development**: Edit files in `electron/` - restart Electron to see changes
4. **Styling**: Uses Tailwind CSS - edit utility classes in components or `app/globals.css`

## Building for Production

Build the Next.js application:
```bash
npm run build
```

The Electron app can be packaged using the configuration in `package.json` under the `build` section.

## Technologies Used

### Frontend
- React 18
- Next.js 15 (with Turbopack)
- Tailwind CSS 4
- Chart.js, Recharts (data visualization)
- React Day Picker (calendar)
- Lucide React (icons)

### Backend
- Python FastAPI
- Uvicorn (ASGI server)
- Supabase (authentication & database)
- Kafka (aiokafka for message streaming)
- NumPy, SciPy (data processing)

### Desktop
- Electron 34
- @abandonware/noble (Bluetooth Low Energy)
- @electron/remote (IPC communication)

### DevOps
- Concurrently (parallel process management)
- Docker Compose (container orchestration)
- GitHub Actions (CI/CD runner configuration in `actions-runner/`)

## Troubleshooting

**Kafka/Redpanda issues:**
- **Ensure Docker Desktop is running** (check your system tray/menu bar for the Docker icon)
- Verify Docker is accessible: `docker --version`
- Check if Redpanda container is running: `docker ps`
- If port 9092 is already in use, stop other Kafka instances or change the port in `docker-compose.yml`
- View Redpanda logs: `docker-compose logs redpanda`
- Restart the container: `docker-compose restart`

**Backend won't start:**
- Ensure the `.venv` directory exists and contains your Python virtual environment
- Verify all dependencies are installed: `pip install -r backend/requirements.txt`
- Check that Python 3.8+ is installed: `python --version`
- **Ensure Redpanda is running** - the backend requires Kafka for message processing

**Frontend won't start:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Electron won't launch:**
- Ensure frontend is running on port 3000
- Check for port conflicts: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)

**Bluetooth issues:**
- On macOS: Grant Bluetooth permissions in System Preferences
- On Linux: May require additional packages (bluez, libudev-dev)
- On Windows: Ensure Bluetooth drivers are up to date

## Contributing

This project is developed in partnership with The Ohio State University Smarthub Research Group. For contribution guidelines, please contact the maintainers.
