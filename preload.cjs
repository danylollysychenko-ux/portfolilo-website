const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("portfolioDesktop", {
  loadCurrent: () => ipcRenderer.invoke("portfolio:load-current"),
  saveCurrent: (portfolio) =>
    ipcRenderer.invoke("portfolio:save-current", portfolio),
  saveFile: (payload) => ipcRenderer.invoke("portfolio:save-file", payload),
  readFile: (fileRef) => ipcRenderer.invoke("portfolio:read-file", fileRef),
  removeFile: (fileRef) => ipcRenderer.invoke("portfolio:remove-file", fileRef),
  clearCurrent: () => ipcRenderer.invoke("portfolio:clear-current"),
  exportArchive: (portfolio, name) =>
    ipcRenderer.invoke("portfolio:export-archive", portfolio, name),
  exportPdf: (portfolio, name) =>
    ipcRenderer.invoke("portfolio:export-pdf", portfolio, name),
  preview: (portfolio, contents) =>
    ipcRenderer.invoke("portfolio:preview", portfolio, contents),
  updateProfilePosition: (position) =>
    ipcRenderer.send("portfolio:update-profile-position", position),
  updateProfileImage: (profile) =>
    ipcRenderer.send("portfolio:update-profile-image", profile),
  onProfilePositionChanged: (callback) =>
    ipcRenderer.on("portfolio:profile-position", (_, position) =>
      callback(position),
    ),
  onProfileImageChanged: (callback) =>
    ipcRenderer.on("portfolio:profile-image", (_, profile) => callback(profile)),
  printPreview: () => ipcRenderer.invoke("portfolio:print-preview"),
  importArchive: () => ipcRenderer.invoke("portfolio:import-archive"),
  loadExample: () => ipcRenderer.invoke("portfolio:load-example"),
});
