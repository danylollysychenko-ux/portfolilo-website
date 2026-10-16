const { app, BrowserWindow } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

console.log("VERIFY START");
app
  .whenReady()
  .then(async () => {
    console.log("VERIFY READY");
    const root =
      "C:\\Users\\CMP_DaLysychenko\\AppData\\Roaming\\ects-career-portfolio\\portfolio";
    const portfolio = JSON.parse(
      await fs.readFile(path.join(root, "portfolio.json"), "utf8"),
    );
    const files = await fs.readdir(path.join(root, "files"));
    const refs = new Map();
    const walk = (value) => {
      if (!value || typeof value !== "object") return;
      if (typeof value.fileRef === "string" && !refs.has(value.fileRef))
        refs.set(value.fileRef, value);
      for (const child of Object.values(value)) walk(child);
    };
    walk(portfolio);
    const attachments = {};
    for (const [fileRef, metadata] of refs) {
      const stored = files.find((name) => name.startsWith(`${fileRef}.`));
      if (!stored) throw new Error(`Missing attachment ${fileRef}`);
      const bytes = await fs.readFile(path.join(root, "files", stored));
      attachments[fileRef] = {
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        base64: bytes.toString("base64"),
      };
    }
    const win = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    console.log("VERIFY WINDOW");
    await win.loadFile(path.join(__dirname, "export.html"));
    console.log("VERIFY LOADED");
    await win.webContents.executeJavaScript(
      `window.__EXPORT_DATA__=${JSON.stringify({ portfolio, attachments })};window.dispatchEvent(new Event('export-data-ready'));`,
    );
    await win.webContents.executeJavaScript(
      `new Promise((resolve, reject) => {
        const started = Date.now();
        const check = () => {
          if (window.__EXPORT_READY__ === true) resolve();
          else if (Date.now() - started > 60000) reject(new Error('Export renderer did not become ready.'));
          else setTimeout(check, 50);
        };
        check();
      })`,
    );
    console.log("VERIFY RENDERED");
    const data = await win.webContents.printToPDF({
      printBackground: true,
      displayHeaderFooter: false,
      pageSize: "Letter",
      margins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
      preferCSSPageSize: true,
    });
    await fs.writeFile(
      "C:\\Javascript\\Bennetts Portfolio maker\\verification-export.pdf",
      Buffer.from(data),
    );
    console.log(
      JSON.stringify({
        uniqueReferences: Object.keys(attachments).length,
        bytes: data.length,
      }),
    );
    win.destroy();
    app.quit();
  })
  .catch((error) => {
    console.error(error);
    app.exit(1);
  });
