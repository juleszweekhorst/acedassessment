const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const screenshot = require("screenshot-desktop");
const fs = require("fs");
const { OpenAI } = require("openai");

let config;
try {
  const configPath = path.join(__dirname, "config.json");
  const configData = fs.readFileSync(configPath, "utf8");
  config = JSON.parse(configData);

  if (!config.apiKey) {
    throw new Error("No API key  in config.json");
  }

  // Set default model if not specified
  if (!config.model) {
    config.model = "gpt-4o-mini";
    console.log("Model not specified in config, using default:", config.model);
  }
} catch (err) {
  console.error("Error reading config:", err);
  app.quit();
}
const openai = new OpenAI({ apiKey: config.apiKey });


// --- Application state ---

let mainWindow;
let screenshots = [];

// --- Helper Functions ---

function updateInstruction(instruction) {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send("update-instruction", instruction);
  }
}

function hideInstruction() {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send("hide-instruction");
  }
}

async function captureScreenshot() {
  try {
    hideInstruction();
    mainWindow.hide();
    await new Promise((res) => setTimeout(res, 200));

    const timestamp = Date.now();
    const imagePath = path.join(
      app.getPath("pictures"),
      `screenshot_${timestamp}.png`
    );
    await screenshot({ filename: imagePath });

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    mainWindow.show();
    return base64Image;
  } catch (err) {
    mainWindow.show();
    if (mainWindow.webContents) {
      mainWindow.webContents.send("error", err.message);
    }
    throw err;
  }
}

// --- Screenshot Handling ---
async function processScreenshots() {
  try {
    // Build message with text + each screenshot
    const messages = [
      {
        type: "text",
        text: "Can you solve the following abstract reasoning question for me and give the correct or most likely answer?",
      },
    ];
    for (const img of screenshots) {
      messages.push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${img}` },
      });
    }

    // Make the request
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: messages }],
      max_completion_tokens: 2000,
    });

    // Send the text to the renderer
    mainWindow.webContents.send(
      "analysis-result",
      response.choices[0].message.content
    );
  } catch (err) {
    console.error("Error in processScreenshots:", err);
    if (mainWindow.webContents) {
      mainWindow.webContents.send("error", err.message);
    }
  }
}

// Reset everything
function resetProcess() {
  screenshots = [];
  mainWindow.webContents.send("clear-result");
  updateInstruction("Ctrl+Shift+S: Screenshot ");
}

// --- Window Creation ---

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    paintWhenInitiallyHidden: true,
    contentProtection: true,
    type: "toolbar",
  });

  mainWindow.loadFile("index.html");
  mainWindow.setContentProtection(true);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver", 1);

  // ---- ALL SHORTCUTS BELOW ----
  const resizeStep = 50; // pixels

  function resizeWindow(deltaWidth, deltaHeight) {
    const [width, height] = mainWindow.getSize();
    mainWindow.setSize(width + deltaWidth, height + deltaHeight);
  }

  // Increase window size: Ctrl+Shift+= (use "=" because "+" requires Shift)
  globalShortcut.register("CommandOrControl+Shift+=", () => {
    resizeWindow(resizeStep, resizeStep);
  });

  // Decrease window size: Ctrl+Shift+-
  globalShortcut.register("CommandOrControl+Shift+-", () => {
    resizeWindow(-resizeStep, -resizeStep);
  });

  const moveStep = 20;
  function moveWindow(offsetX, offsetY) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + offsetX, y + offsetY);
  }

  globalShortcut.register("CommandOrControl+Shift+S", async () => {
    try {
      const img = await captureScreenshot();
      screenshots.push(img);
      await processScreenshots();
    } catch (error) {
      console.error("Ctrl+Shift+S error:", error);
    }
  });

  globalShortcut.register("CommandOrControl+Shift+R", () => {
    resetProcess();
  });

  globalShortcut.register("CommandOrControl+Shift+Q", () => {
    console.log("Quitting application...");
    app.quit();
  });

  globalShortcut.register("CommandOrControl+Shift+Up", () =>
    moveWindow(0, -moveStep)
  );
  globalShortcut.register("CommandOrControl+Shift+Down", () =>
    moveWindow(0, moveStep)
  );
  globalShortcut.register("CommandOrControl+Shift+Left", () =>
    moveWindow(-moveStep, 0)
  );
  globalShortcut.register("CommandOrControl+Shift+Right", () =>
    moveWindow(moveStep, 0)
  );
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
