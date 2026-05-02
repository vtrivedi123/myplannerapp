const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

let serverProcess
let mainWindow

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  return
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

// Find the .env file — works both in dev and packaged exe
function getEnvPath() {
  if (app.isPackaged) {
    // When packaged, resources are in process.resourcesPath
    return path.join(process.resourcesPath, 'app', '.env')
  }
  // In dev, .env is in project root
  return path.join(__dirname, '..', '.env')
}

// Parse .env file manually and return as object
function loadEnv() {
  const envPath = getEnvPath()
  const env = { ...process.env }

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key) env[key.trim()] = rest.join('=').trim()
    }
  } else {
    console.warn('Warning: .env file not found at', envPath)
  }

  return env
}

function getOfflinePath() {
  return path.join(__dirname, 'offline.html')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#090e17',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const offlinePath = getOfflinePath()
  if (!fs.existsSync(offlinePath)) {
    console.error('Offline page not found:', offlinePath)
  }
  mainWindow.loadURL(pathToFileURL(offlinePath).href)

  // Uncomment the line below to open DevTools for debugging:
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'dist', 'index.js')
    : path.join(__dirname, '..', 'dist', 'index.js')

  const env = loadEnv()
  env.NODE_ENV = 'production'
  env.PORT = '4000'

  serverProcess = spawn(process.execPath, [serverPath], {
    env,
    stdio: 'inherit'
  })

  serverProcess.on('error', (err) => {
    console.error('Server failed to start:', err)
  })
}

function waitForServer(url, retries = 30, delay = 500) {
  return new Promise((resolve, reject) => {
    const http = require('http')

    const attempt = (n) => {
      http.get(url, () => {
        resolve()
      }).on('error', () => {
        if (n <= 0) {
          reject(new Error('Server did not start in time'))
        } else {
          setTimeout(() => attempt(n - 1), delay)
        }
      })
    }

    attempt(retries)
  })
}

app.whenReady().then(async () => {
  createWindow()
  startServer()

  try {
    await waitForServer('http://localhost:4000')
    if (mainWindow) {
      mainWindow.loadURL('http://localhost:4000')
    }
  } catch (err) {
    console.error('Could not connect to server:', err)
    // Keep the app open so the launcher is available even when the backend is down.
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  app.quit()
})

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill()
})
