const { app, BrowserWindow, dialog, ipcMain, protocol, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "ects",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      codeCache: true,
    },
  },
]);

const dataDirectory = () => path.join(app.getPath("userData"), "portfolio");
const portfolioPath = () => path.join(dataDirectory(), "portfolio.json");
const uploadsPath = () => path.join(dataDirectory(), "files");
const MAX_ARCHIVE_BYTES = 1024 * 1024 * 1024;
const PDF_MARGIN_INCHES = 0.75;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeZip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const filename = Buffer.from(name.replace(/\\/g, "/"), "utf8");
    const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const packed = zlib.deflateRawSync(raw);
    const crc = crc32(raw);
    const local = Buffer.alloc(30 + filename.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(filename.length, 26);
    filename.copy(local, 30);
    locals.push(local, packed);
    const header = Buffer.alloc(46 + filename.length);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x800, 8);
    header.writeUInt16LE(8, 10);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(packed.length, 20);
    header.writeUInt32LE(raw.length, 24);
    header.writeUInt16LE(filename.length, 28);
    header.writeUInt32LE(offset, 42);
    filename.copy(header, 46);
    central.push(header);
    offset += local.length + packed.length;
  }
  const centralData = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralData.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralData, end]);
}

function unzip(buffer) {
  if (buffer.length > MAX_ARCHIVE_BYTES)
    throw new Error("Archive is too large.");
  const entries = new Map();
  let end = -1;
  for (
    let i = buffer.length - 22;
    i >= Math.max(0, buffer.length - 65557);
    i--
  ) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("This is not a valid portfolio ZIP archive.");
  const count = buffer.readUInt16LE(end + 10);
  let cursor = buffer.readUInt32LE(end + 16);
  for (let index = 0; index < count; index++) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50)
      throw new Error("The portfolio archive is damaged.");
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    if (
      name.startsWith("/") ||
      name.includes("\\") ||
      name.split("/").includes("..")
    )
      throw new Error("The archive contains an unsafe file path.");
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50)
      throw new Error("The portfolio archive is damaged.");
    const localName = buffer.readUInt16LE(localOffset + 26);
    const localExtra = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localName + localExtra;
    const packed = buffer.subarray(start, start + compressedSize);
    const data =
      method === 8 ? zlib.inflateRawSync(packed) : method === 0 ? packed : null;
    if (!data)
      throw new Error("The archive uses an unsupported compression method.");
    if (data.length > MAX_ARCHIVE_BYTES)
      throw new Error("An archive file is too large.");
    entries.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function walkFileReferences(value, callback, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (typeof value.fileRef === "string") callback(value);
  for (const child of Object.values(value))
    walkFileReferences(child, callback, seen);
}

function safeFileId(value) {
  return typeof value === "string" && /^[a-f0-9-]{20,80}$/i.test(value);
}

async function writePortfolio(portfolio) {
  await fs.mkdir(uploadsPath(), { recursive: true });
  const temp = `${portfolioPath()}.tmp`;
  await fs.writeFile(temp, JSON.stringify(portfolio), "utf8");
  await fs.rename(temp, portfolioPath());
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  window.webContents.on("console-message", (_, level, message) => {
    if (level >= 1) console.error("[Renderer]", message);
  });
  window.webContents.on("render-process-gone", (_, details) => {
    console.error("[Renderer] Render process gone:", details.reason);
  });
  window.loadFile(path.join(__dirname, "index 1.html"));
}

app.whenReady().then(() => {
  protocol.handle("ects", async (request) => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== "app")
        return new Response("Not found", { status: 404 });
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const target = path.resolve(__dirname, relative);
      if (target !== __dirname && !target.startsWith(__dirname + path.sep))
        return new Response("Forbidden", { status: 403 });
      const data = await fs.readFile(target);
      const ext = path.extname(target).toLowerCase();
      const types = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json",
        ".wasm": "application/wasm",
        ".bcmap": "application/octet-stream",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".otf": "font/otf",
      };
      return new Response(data, {
        headers: { "Content-Type": types[ext] || "application/octet-stream" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
  ipcMain.handle("portfolio:load-current", async () => {
    try {
      return JSON.parse(await fs.readFile(portfolioPath(), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw new Error("The saved portfolio could not be read.");
    }
  });
  ipcMain.handle("portfolio:save-current", async (_, portfolio) =>
    writePortfolio(portfolio),
  );
  ipcMain.handle(
    "portfolio:save-file",
    async (_, { fileName, fileType, bytes, previousRef }) => {
      const fileId = require("node:crypto").randomUUID();
      const ext = path
        .extname(String(fileName || ""))
        .slice(0, 16)
        .replace(/[^.a-z0-9]/gi, "");
      await fs.mkdir(uploadsPath(), { recursive: true });
      await fs.writeFile(
        path.join(uploadsPath(), `${fileId}${ext}`),
        Buffer.from(bytes),
      );
      if (safeFileId(previousRef)) {
        for (const name of await fs.readdir(uploadsPath()))
          if (name.startsWith(previousRef + "."))
            await fs.unlink(path.join(uploadsPath(), name));
      }
      return {
        fileRef: fileId,
        fileName: String(fileName || "Uploaded file"),
        fileType: String(fileType || ""),
        uploadedAt: new Date().toISOString(),
      };
    },
  );
  ipcMain.handle("portfolio:read-file", async (_, fileRef) => {
    if (!safeFileId(fileRef))
      throw new Error("This attachment reference is invalid.");
    const name = (await fs.readdir(uploadsPath())).find((candidate) =>
      candidate.startsWith(`${fileRef}.`),
    );
    if (!name)
      throw new Error("This attachment is missing from the app data folder.");
    return {
      base64: (await fs.readFile(path.join(uploadsPath(), name))).toString(
        "base64",
      ),
    };
  });
  ipcMain.handle("portfolio:remove-file", async (_, fileRef) => {
    if (!safeFileId(fileRef)) return;
    for (const name of await fs.readdir(uploadsPath()).catch(() => []))
      if (name.startsWith(fileRef + "."))
        await fs.unlink(path.join(uploadsPath(), name));
  });
  ipcMain.handle("portfolio:clear-current", async () =>
    fs.rm(dataDirectory(), { recursive: true, force: true }),
  );
  ipcMain.handle("portfolio:preview", async (_, portfolio, contents) => {
    const student = portfolio.student || {};
    const studentName = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || student.displayName || "Student";
    const previewData = structuredClone(portfolio);
    previewData.tableOfContents = Array.isArray(contents) ? contents : [];
    const documentReferences = new Map();
    const documentRecords = [
      portfolio.hiringDocuments?.coverLetter,
      portfolio.hiringDocuments?.resume,
      portfolio.hiringDocuments?.standardApplication,
      portfolio.supportingAcademics?.documents?.employment,
      ...Object.values(portfolio.supportingAcademics?.documents || {}),
      ...(portfolio.recommendations || []),
      ...(portfolio.workSamples || []),
      ...(portfolio.credentials || []),
      ...(portfolio.careerSafe?.entries || []),
    ];
    for (const record of documentRecords)
      walkFileReferences(record, (file) => {
        if (file.fileRef && safeFileId(file.fileRef))
          documentReferences.set(file.fileRef, {
            fileName: file.fileName || "Attached document",
            fileType: file.fileType || "application/octet-stream",
          });
      });
    const storedFiles = await fs.readdir(uploadsPath()).catch(() => []);
    previewData.previewAttachments = {};
    for (const [fileRef, metadata] of documentReferences) {
      const storedName = storedFiles.find((candidate) =>
        candidate.startsWith(`${fileRef}.`),
      );
      if (!storedName) continue;
      const bytes = await fs.readFile(path.join(uploadsPath(), storedName));
      previewData.previewAttachments[fileRef] = {
        ...metadata,
        base64: bytes.toString("base64"),
      };
    }
    const profileImage = previewData.student?.profileImage;
    if (profileImage?.fileRef && safeFileId(profileImage.fileRef)) {
      const storedName = (await fs.readdir(uploadsPath()).catch(() => [])).find(
        (candidate) => candidate.startsWith(`${profileImage.fileRef}.`),
      );
      if (storedName) {
        const bytes = await fs.readFile(path.join(uploadsPath(), storedName));
        profileImage.previewDataUrl = `data:${profileImage.fileType || "image/jpeg"};base64,${bytes.toString("base64")}`;
      }
    }
    const previewWindow = new BrowserWindow({
      width: 1000,
      height: 850,
      minWidth: 680,
      minHeight: 600,
      title: `${studentName} - Portfolio Preview`,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.cjs"),
      },
    });
    previewWindow.on("page-title-updated", (event) => event.preventDefault());
    await previewWindow.loadFile(path.join(__dirname, "preview.html"));
    await previewWindow.webContents.executeJavaScript(`(async () => {
      window.__ABOUT_ME_DATA__ = ${JSON.stringify(previewData)};
      window.dispatchEvent(new Event('about-me-data-ready'));
      await window.__PREVIEW_READY__;
    })()`);
    return true;
  });
  ipcMain.handle("portfolio:print-preview", async (event) => {
    const contents = event.sender;
    if (contents.isDestroyed()) throw new Error("The preview window is closed.");
    await contents.executeJavaScript(`Promise.all([
      document.fonts?.ready || Promise.resolve(),
      ...Array.from(document.images, (image) => image.decode().catch(() => {})),
    ])`);
    const pdf = await contents.printToPDF({
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `<div style="width:100%;margin:0 .8in;color:#657482;font:8px Arial,sans-serif;text-align:right;"><span class="pageNumber"></span></div>`,
      pageSize: "Letter",
      margins: { top: 0.2, right: 0, bottom: 0.2, left: 0 },
    });
    const previewName = contents
      .getTitle()
      .replace(/\s*\|\s*About Me$/i, "")
      .replace(/[<>:"/\\|?*]/g, "-")
      .trim() || "Portfolio";
    const pdfPath = path.join(
      app.getPath("temp"),
      `${previewName}-Print-Preview-${require("node:crypto").randomUUID()}.pdf`,
    );
    await fs.writeFile(pdfPath, pdf);
    const openError = await shell.openPath(pdfPath);
    if (openError) {
      await fs.rm(pdfPath, { force: true }).catch(() => {});
      throw new Error(`The PDF was created, but could not be opened: ${openError}`);
    }
    return true;
  });
  ipcMain.handle(
    "portfolio:export-pdf",
    async (_, portfolio, suggestedName) => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Save ECTS portfolio PDF",
        defaultPath: `${suggestedName || "ects-career-portfolio"}.pdf`,
        filters: [{ name: "PDF document", extensions: ["pdf"] }],
      });
      if (canceled || !filePath) return false;

      const references = new Map();
      walkFileReferences(portfolio, (record) => {
        if (record.fileRef && !references.has(record.fileRef)) {
          references.set(record.fileRef, {
            fileName: record.fileName || "Attached document",
            fileType: record.fileType || "application/octet-stream",
          });
        }
      });
      const storedNames = await fs.readdir(uploadsPath()).catch(() => []);
      const attachments = {};
      for (const [fileRef, metadata] of references) {
        const storedName = storedNames.find((candidate) =>
          candidate.startsWith(`${fileRef}.`),
        );
        if (!storedName) {
          throw new Error(
            `The attachment “${fileRef}” is missing from this computer.`,
          );
        }
        const bytes = await fs.readFile(path.join(uploadsPath(), storedName));
        attachments[fileRef] = {
          ...metadata,
          base64: bytes.toString("base64"),
        };
      }

      const exportWindow = new BrowserWindow({
        show: false,
        width: 900,
        height: 1200,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });
      try {
        await exportWindow.loadFile(path.join(__dirname, "export.html"));
        await exportWindow.webContents.executeJavaScript(`
        window.__EXPORT_DATA__ = ${JSON.stringify({
          portfolio,
          attachments,
        })};
        window.dispatchEvent(new Event('export-data-ready'));
      `);
        await exportWindow.webContents.executeJavaScript(
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
        const data = await exportWindow.webContents.printToPDF({
          printBackground: true,
          displayHeaderFooter: false,
          pageSize: "Letter",
          margins: {
            top: 0.75,
            right: 0.75,
            bottom: 0.75,
            left: 0.75,
          },
          preferCSSPageSize: true,
        });
        await fs.writeFile(filePath, Buffer.from(data));
        return true;
      } finally {
        exportWindow.destroy();
      }
    },
  );
  ipcMain.handle(
    "portfolio:export-archive",
    async (_, portfolio, suggestedName) => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Save ECTS portfolio",
        defaultPath: `${suggestedName || "ects-career-portfolio"}.ects-portfolio`,
        filters: [{ name: "ECTS Portfolio", extensions: ["ects-portfolio"] }],
      });
      if (canceled || !filePath) return false;
      const payload = JSON.parse(JSON.stringify(portfolio));
      payload.schemaVersion = payload.schemaVersion || 1;
      const originalRelationships = new Map();
      walkFileReferences(payload, (record) => {
        if (!originalRelationships.has(record.fileRef))
          originalRelationships.set(record.fileRef, {
            fileRef: record.fileRef,
            fileName: record.fileName || "",
            fileType: record.fileType || "",
          });
      });
      const storedNames = await fs.readdir(uploadsPath()).catch(() => []);
      const filesByHash = new Map();
      const referenceMap = new Map();
      for (const reference of originalRelationships.keys()) {
        const name = storedNames.find((candidate) =>
          candidate.startsWith(`${reference}.`),
        );
        if (!name)
          throw new Error(
            `The attachment “${reference}” is missing from this computer.`,
          );
        const data = await fs.readFile(path.join(uploadsPath(), name));
        const digest = crypto.createHash("sha256").update(data).digest("hex");
        if (!filesByHash.has(digest))
          filesByHash.set(digest, [`files/${name}`, data, reference]);
        referenceMap.set(reference, filesByHash.get(digest)[2]);
      }
      walkFileReferences(payload, (record) => {
        record.fileRef = referenceMap.get(record.fileRef) || record.fileRef;
      });
      const files = [...filesByHash.values()].map(([name, data]) => [name, data]);
      const relationships = [];
      const relationshipRefs = new Set();
      walkFileReferences(payload, (record) => {
        if (relationshipRefs.has(record.fileRef)) return;
        relationshipRefs.add(record.fileRef);
        const oldReference = [...referenceMap].find(([, canonical]) => canonical === record.fileRef)?.[0];
        const original = originalRelationships.get(oldReference || record.fileRef) || {};
        relationships.push({
          fileRef: record.fileRef,
          fileName: original.fileName || record.fileName || "",
          fileType: original.fileType || record.fileType || "",
        });
      });
      const manifest = {
        format: "ects-portfolio",
        version: 1,
        portfolioFile: "portfolio.json",
        files: files.map(([name]) => name),
        relationships,
      };
      const archive = makeZip([
        ["portfolio.json", Buffer.from(JSON.stringify(payload, null, 2))],
        ["manifest.json", Buffer.from(JSON.stringify(manifest, null, 2))],
        ...files,
      ]);
      await fs.writeFile(filePath, archive);
      return true;
    },
  );
  ipcMain.handle("portfolio:import-archive", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Open ECTS portfolio",
      properties: ["openFile"],
      filters: [{ name: "ECTS Portfolio", extensions: ["ects-portfolio"] }],
    });
    if (canceled || !filePaths[0]) return null;
    const entries = unzip(await fs.readFile(filePaths[0]));
    const manifest = JSON.parse(
      entries.get("manifest.json")?.toString("utf8") || "null",
    );
    if (
      !manifest ||
      manifest.format !== "ects-portfolio" ||
      manifest.portfolioFile !== "portfolio.json"
    )
      throw new Error("This file is not a supported ECTS portfolio.");
    const portfolio = JSON.parse(
      entries.get("portfolio.json")?.toString("utf8") || "null",
    );
    if (!portfolio || typeof portfolio !== "object")
      throw new Error("The portfolio data is missing or invalid.");
    const tempDir = `${dataDirectory()}-import-${Date.now()}`;
    await fs.mkdir(path.join(tempDir, "files"), { recursive: true });
    try {
      for (const name of manifest.files || []) {
        if (
          typeof name !== "string" ||
          !name.startsWith("files/") ||
          name.includes("..") ||
          name.includes("\\")
        )
          throw new Error("The archive contains an unsafe file path.");
        const id = path.basename(name).split(".")[0];
        if (!safeFileId(id))
          throw new Error("The archive contains an invalid file reference.");
        const data = entries.get(name);
        if (!data) throw new Error("A portfolio attachment is missing.");
        await fs.writeFile(
          path.join(tempDir, "files", path.basename(name)),
          data,
        );
      }
      await fs.writeFile(
        path.join(tempDir, "portfolio.json"),
        JSON.stringify(portfolio),
        "utf8",
      );
      await fs.rm(dataDirectory(), { recursive: true, force: true });
      await fs.rename(tempDir, dataDirectory());
    } catch (error) {
      await fs.rm(tempDir, { recursive: true, force: true });
      throw error;
    }
    return portfolio;
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
