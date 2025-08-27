const {app, BrowserWindow, ipcMain} = require("electron")
const path = require("path")
const { contextIsolated } = require("process")
const { spawn } = require('child_process')

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

ipcMain.on('run-python', (event, formData) => {
    console.log("Received form data:", formData);

    const pythonProcess = spawn('python', ['renderer/scrapper.py', 
        formData.email, 
        formData.password, 
        formData.question, 
        formData.answer
    ]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        event.reply('python-output', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
});

