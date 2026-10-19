const docxResizeObservers = new WeakMap();
const fileLoads = new Map();
const pdfDocuments = new Map();
let pdfjsPromise;
let docxPromise;

function loadPdfJs() {
  pdfjsPromise ||= import("./node_modules/pdfjs-dist/build/pdf.mjs").then((pdfjsLib) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
    return pdfjsLib;
  });
  return pdfjsPromise;
}

function loadDocx() {
  docxPromise ||= new Promise((resolve, reject) => {
    const loadScript = (src) => new Promise((scriptResolve, scriptReject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = scriptResolve;
      script.onerror = () => scriptReject(new Error("Word document preview could not be loaded."));
      document.head.append(script);
    });
    loadScript("./node_modules/jszip/dist/jszip.min.js")
      .then(() => loadScript("./node_modules/docx-preview/dist/docx-preview.min.js"))
      .then(() => {
        if (!window.docx?.renderAsync) throw new Error("Word document preview could not be loaded.");
        resolve(window.docx);
      })
      .catch(reject);
  });
  return docxPromise;
}

async function loadAttachment(request) {
  if (request.base64) {
    const response = await fetch(`data:application/octet-stream;base64,${request.base64}`);
    return new Uint8Array(await response.arrayBuffer());
  }
  if (!request.fileRef || !window.portfolioDesktop?.readFile)
    throw new Error("The attached file could not be loaded for preview.");

  if (!fileLoads.has(request.fileRef)) {
    fileLoads.set(request.fileRef, window.portfolioDesktop.readFile(request.fileRef).then(async (result) => {
      if (!result?.base64) throw new Error("The attached file could not be loaded for preview.");
      const response = await fetch(`data:application/octet-stream;base64,${result.base64}`);
      return new Uint8Array(await response.arrayBuffer());
    }).catch((error) => {
      fileLoads.delete(request.fileRef);
      throw error;
    }));
  }
  return fileLoads.get(request.fileRef);
}

function fitDocxPages(container) {
  const style = getComputedStyle(container);
  const horizontalPadding =
    Number.parseFloat(style.paddingLeft || "0") +
    Number.parseFloat(style.paddingRight || "0");
  const availableWidth = Math.max(1, container.clientWidth - horizontalPadding);

  for (const page of container.querySelectorAll(".docx")) {
    page.style.zoom = "1";
    const pageWidth = page.getBoundingClientRect().width;
    if (pageWidth > availableWidth)
      page.style.zoom = String(availableWidth / pageWidth);
  }
}

async function renderDocument({ bytes, fileName, fileType, fileRef }, container) {
  container.replaceChildren();
  const extension = (fileName || "").split(".").pop().toLowerCase();
  const type = (fileType || "").toLowerCase();

  if (type.includes("pdf") || extension === "pdf") {
    const pdfjsLib = await loadPdfJs();
    let pdfPromise = fileRef && pdfDocuments.get(fileRef);
    if (!pdfPromise) {
      pdfPromise = pdfjsLib.getDocument({ data: bytes }).promise;
      if (fileRef) {
        pdfDocuments.set(fileRef, pdfPromise);
        pdfPromise.catch(() => pdfDocuments.delete(fileRef));
      }
    }
    const pdf = await pdfPromise;
    const padding =
      Number.parseFloat(getComputedStyle(container).paddingLeft || "0") +
      Number.parseFloat(getComputedStyle(container).paddingRight || "0");
    const availableWidth = Math.max(
      240,
      (container.clientWidth || 720) - padding,
    );
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(1, availableWidth / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const pageWrapper = document.createElement("div");
      pageWrapper.className = "pdf-page-wrapper";
      const canvas = document.createElement("canvas");
      canvas.className = "pdf-page";
      canvas.width = Math.ceil(viewport.width * devicePixelRatio);
      canvas.height = Math.ceil(viewport.height * devicePixelRatio);
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      pageWrapper.append(canvas);
      container.append(pageWrapper);
      await page.render({
        canvas,
        canvasContext: canvas.getContext("2d"),
        viewport,
        transform: [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0],
      }).promise;
    }
    return;
  }

  if (extension === "docx" || type.includes("wordprocessingml")) {
    const docx = await loadDocx();
    await docx.renderAsync(bytes, container, container, {
      className: "docx",
      inWrapper: true,
      breakPages: true,
      renderHeaders: true,
      renderFooters: true,
    });
    fitDocxPages(container);
    if (!docxResizeObservers.has(container)) {
      const observer = new ResizeObserver(() => fitDocxPages(container));
      observer.observe(container);
      docxResizeObservers.set(container, observer);
    }
    return;
  }

  if (
    ["png", "jpg", "jpeg", "gif", "webp"].includes(extension) ||
    type.startsWith("image/")
  ) {
    const image = document.createElement("img");
    image.className = "attachment-image";
    image.alt = fileName || "Attached image";
    image.src = URL.createObjectURL(
      new Blob([bytes], { type: fileType || "application/octet-stream" }),
    );
    container.append(image);
    return;
  }

  if (extension === "doc")
    throw new Error(
      "Legacy .doc files cannot be previewed here. Save the document as .docx or PDF to see its pages in the preview.",
    );
  throw new Error("Preview is available for PDF, DOCX, and image files.");
}

const pendingRenders = new WeakMap();
const activeRenders = new Set();
const renderObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        renderObserver.unobserve(entry.target);
        const render = pendingRenders.get(entry.target);
        pendingRenders.delete(entry.target);
        if (render) render();
      }
    }, { rootMargin: "700px 0px" })
  : null;

function queueDocument(request, container) {
  container.replaceChildren();
  container.dataset.previewState = "waiting";
  const render = async () => {
    if (!container.isConnected || container.dataset.previewState === "loading") return;
    container.dataset.previewState = "loading";
    const task = (async () => {
      try {
        const bytes = await loadAttachment(request);
        await renderDocument({
          bytes,
          fileName: request.fileName,
          fileType: request.fileType,
          fileRef: request.fileRef,
        }, container);
        container.dataset.previewState = "loaded";
      } catch (error) {
        container.textContent = error.message || "This document could not be previewed.";
        container.classList.add("document-error");
        container.dataset.previewState = "error";
      }
      document.dispatchEvent(new CustomEvent("document-preview-rendered", { detail: { container } }));
    })();
    activeRenders.add(task);
    try {
      await task;
    } finally {
      activeRenders.delete(task);
    }
  };

  if (!renderObserver) {
    void render();
    return;
  }
  pendingRenders.set(container, render);
  renderObserver.observe(container);
}

async function loadImage(fileRef, fileType) {
  const bytes = await loadAttachment({ fileRef });
  return URL.createObjectURL(new Blob([bytes], { type: fileType || "image/jpeg" }));
}

async function loadAll() {
  await Promise.all([...activeRenders]);
  for (const container of document.querySelectorAll('.document-pages[data-preview-state="waiting"]')) {
    renderObserver?.unobserve(container);
    const render = pendingRenders.get(container);
    pendingRenders.delete(container);
    if (render) await render();
  }
  await Promise.all([...activeRenders]);
}

window.documentRenderer = { render: queueDocument, loadImage, loadAll };
