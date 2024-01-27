const { dialog, ipcMain, app, BrowserWindow } = require("electron");
const { readFile, writeFile } = require("fs");
const { join } = require("path");

const isDev = false;
let main;

const createWindow = () => {
    main = new BrowserWindow({
        height: 600,
        width: 900,
        icon: join(__dirname, "icon.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    main.loadFile("./src/html/index.html");

    if (isDev) main.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    app.quit();
});

ipcMain.on("save", (event, content) => {
    dialog
        .showSaveDialog(main, {
            buttonLabel: "Save Markdown File",
            defaultPath: "file.md",
            filters: [{ name: "Markdown", extensions: ["md"] }],
        })
        .then(({ filePath }) => {
            if (filePath)
                writeFile(filePath, content.toString(), (err) => {
                    if (err) console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });
});

ipcMain.on("load", (event) => {
    dialog
        .showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Markdown", extensions: ["md"] }],
        })
        .then(({ filePaths }) => {
            let path = filePaths[0];

            readFile(path, "utf8", (err, content) => {
                if (err) console.error(err);
                else {
                    main.webContents.send("read", { content });
                }
            });
        });
});
