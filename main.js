const {app, BrowserWindow} = require("electron")
const path = require("path")
const { contextIsolated } = require("process")

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV != 'development'

//Create the main window
function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title: "Image Resizer",
        height: 1080,
        width: 1920,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    if(isDev){
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

//App is ready
app.whenReady().then(() => {
    createMainWindow()

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    app.addListener('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createMainWindow()
        }
    })
})

app.addListener('window-all-closed', () => {
    if(!isMac){
        app.quit()
    }
})

