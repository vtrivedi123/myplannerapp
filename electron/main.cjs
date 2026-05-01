const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let serverProcess
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadURL('http://localhost:4000')

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startServer() {
  const serverPath = path.join(__dirname, '..', 'dist', 'index.js')

  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '4000'
    },
    stdio: 'inherit'
  })

  serverProcess.on('error', (err) => {
    console.error('Server failed to start:', err)
  })
}

function waitForServer(url, retries = 20, delay = 500) {
  return new Promise((resolve, reject) => {
    const http = require('http')

    const attempt = (n) => {
      http.get(url, (res) => {
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
  startServer()

  try {
    await waitForServer('http://localhost:4000')
    createWindow()
  } catch (err) {
    console.error('Could not connect to server:', err)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  app.quit()
})

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill()
})
