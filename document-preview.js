import * as pdfjsLib from "./node_modules/pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).href;

const docxResizeObservers = new WeakMap();

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

async function renderDocument({ bytes, fileName, fileType }, container) {
  container.replaceChildren();
  const extension = (fileName || "").split(".").pop().toLowerCase();
  const type = (fileType || "").toLowerCase();

  if (type.includes("pdf") || extension === "pdf") {
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
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
    if (!window.docx?.renderAsync)
      throw new Error("Word document preview could not be loaded.");
    await window.docx.renderAsync(bytes, container, container, {
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

window.documentRenderer = { render: renderDocument };
