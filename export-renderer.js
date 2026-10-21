import * as pdfjsLib from "./node_modules/pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).href;

const state = {
  data: null,
  renderedAttachments: new Map(),
  attachmentReferences: new Map(),
};

const esc = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

const fileObject = (value) =>
  value && typeof value === "object" && value.file ? value.file : value;

const getAttachment = (value) => {
  const file = fileObject(value);
  return file && typeof file === "object" && file.fileRef ? file : null;
};

const dataUrl = (attachment) =>
  `data:${attachment.fileType || "application/octet-stream"};base64,${attachment.base64}`;

const getFileExtension = (fileName = "") =>
  String(fileName).toLowerCase().split(".").pop();

const attachmentCard = (filename, label, error = "") => `
  <div class="attachment-card">
    <div class="attachment-icon" aria-hidden="true">${error ? "!" : "PDF"}</div>
    <div class="attachment-copy">
      <strong>${esc(label)}</strong>
      <span>${esc(filename)}</span>
      ${error ? `<small>${esc(error)}</small>` : `<small>Full document: ${esc(filename)}</small>`}
    </div>
  </div>`;

async function renderPdfAttachment(attachment, label, fileName) {
  try {
    const bytes = Uint8Array.from(atob(attachment.base64), (char) =>
      char.charCodeAt(0),
    );
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const maxWidth = 6.5 * 96;
    const maxHeight = 5 * 96;
    const scale = Math.min(
      1.8,
      maxWidth / viewport.width,
      maxHeight / viewport.height,
    );
    const renderedViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(renderedViewport.width));
    canvas.height = Math.max(1, Math.ceil(renderedViewport.height));
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport: renderedViewport })
      .promise;
    const image = canvas.toDataURL("image/png");
    return `<div class="attachment-card attachment-card--pdf"><div class="attachment-preview"><img src="${image}" alt="${esc(fileName)} first page"></div><div class="attachment-caption"><strong>${esc(label)}</strong><span>${esc(fileName)}</span><small>Full document: ${esc(fileName)}</small></div></div>`;
  } catch (error) {
    console.error("PDF attachment export failed", label, error);
    return attachmentCard(fileName, label, "Could not render this attachment.");
  }
}

async function renderAttachment(value, label, fileName, context) {
  const attachment = getAttachment(value);
  if (!attachment) return "";
  if (state.renderedAttachments.has(attachment.fileRef)) {
    return `<div class="attachment-reference">See: ${esc(context)} — ${esc(attachment.fileName || fileName)}</div>`;
  }
  state.renderedAttachments.set(attachment.fileRef, true);
  state.attachmentReferences.set(attachment.fileRef, {
    label: context,
    fileName: attachment.fileName || fileName,
  });

  const extension = getFileExtension(attachment.fileName || fileName);
  const mime = attachment.fileType || "";
  if (mime.includes("pdf") || extension === "pdf") {
    return await renderPdfAttachment(
      attachment,
      label,
      attachment.fileName || fileName,
    );
  }
  if (mime.startsWith("image/")) {
    return `<div class="attachment-card"><div class="attachment-preview attachment-preview--image"><img src="${dataUrl(attachment)}" alt="${esc(attachment.fileName || fileName)}"></div><div class="attachment-caption"><strong>${esc(label)}</strong><span>${esc(attachment.fileName || fileName)}</span><small>Full document: ${esc(attachment.fileName || fileName)}</small></div></div>`;
  }
  if (extension === "docx" || mime.includes("wordprocessingml")) {
    return attachmentCard(
      attachment.fileName || fileName,
      label,
      "DOCX conversion is unavailable. Open the source file in Word to review it.",
    );
  }
  return attachmentCard(
    attachment.fileName || fileName,
    label,
    "This file type cannot be embedded in the PDF.",
  );
}

const section = (heading, content, id = "") =>
  content
    ? `<section class="export-section" id="${esc(id)}"><h2>${esc(heading)}</h2>${content}</section>`
    : "";

const fileSection = async (value, label, context) => {
  const attachment = getAttachment(value);
  if (!attachment) return "";
  return renderAttachment(value, label, attachment.fileName, context);
};

const renderItem = (item, index, context) => {
  const attachment = getAttachment(item.file);
  const attachmentMarkup = attachment
    ? `
      <div class="entry-attachment">
        ${attachment.fileRef === state.renderedAttachments.get(attachment.fileRef) ? "" : ""}
      </div>`
    : "";
  return `<article class="portfolio-entry"><h3>${esc(item.title || item.name || `${context} ${index + 1}`)}</h3><p>${esc(item.description || "")}</p>${attachmentMarkup}</article>`;
};

async function renderExport(data) {
  state.data = data;
  const portfolio = data.portfolio || {};
  const student = portfolio.student || {};
  const name =
    student.displayName ||
    [student.firstName, student.lastName].filter(Boolean).join(" ");
  const program = portfolio.program?.name || "Program not entered";
  const goal = portfolio.aboutMe?.careerGoal || "Future-ready professional";
  const bio = portfolio.aboutMe?.biography || "";
  const skills = (portfolio.aboutMe?.skills || []).map((skill) => typeof skill === "string" ? skill : skill?.name || "").filter(Boolean).join(", ");
  const interests = (portfolio.aboutMe?.interests || []).join(", ");
  const profile = getAttachment(student.profileImage);
  const profileImage = profile
    ? `<div class="profile-photo"><img src="${dataUrl(profile)}" alt="Profile photograph"></div>`
    : "";

  const workSamples = [];
  for (const [index, item] of (portfolio.workSamples || []).entries()) {
    const attachmentMarkup = await renderAttachment(
      item.file,
      "Work sample attachment",
      item.title || `Work sample ${index + 1}`,
      "Work samples",
    );
    if (item.title || item.description || attachmentMarkup) {
      workSamples.push(
        `<article class="portfolio-entry"><h3>${esc(item.title || `Work sample ${index + 1}`)}</h3><p>${esc(item.description || "")}</p>${attachmentMarkup}</article>`,
      );
    }
  }

  const credentials = [];
  for (const [index, item] of (portfolio.credentials || []).entries()) {
    const attachmentMarkup = await renderAttachment(
      item.file,
      item.name || `Credential ${index + 1}`,
      item.name || `Credential ${index + 1}`,
      "Industry credentials",
    );
    if (
      item.name ||
      item.organization ||
      item.description ||
      attachmentMarkup
    ) {
      credentials.push(
        `<article class="portfolio-entry"><h3>${esc(item.name || `Credential ${index + 1}`)}</h3><p>${esc([item.organization, item.date, item.description].filter(Boolean).join(" · "))}</p>${attachmentMarkup}</article>`,
      );
    }
  }

  const accomplishments = [];
  for (const [kind, items] of Object.entries(portfolio.accomplishments || {})) {
    if (!Array.isArray(items)) continue;
    for (const [index, item] of items.entries()) {
      const attachmentMarkup = await renderAttachment(
        item.file,
        item.title || item.name || kind,
        item.title || item.name || kind,
        kind,
      );
      if (item.title || item.name || item.description || attachmentMarkup) {
        accomplishments.push(
          `<article class="portfolio-entry"><h3>${esc(item.title || item.name || kind)}</h3><p>${esc(item.description || "")}</p>${attachmentMarkup}</article>`,
        );
      }
    }
  }

  const careerSafe = [];
  for (const item of portfolio.careerSafe?.entries || []) {
    const attachmentMarkup = await renderAttachment(
      item.certificate,
      item.selectedOption || "CareerSafe certificate",
      item.selectedOption || "CareerSafe certificate",
      "CareerSafe",
    );
    if (
      item.selectedOption ||
      item.notes ||
      item.completionDate ||
      attachmentMarkup
    ) {
      careerSafe.push(
        `<article class="portfolio-entry"><h3>${esc(item.selectedOption || "CareerSafe certification")}</h3><p>${esc([item.category, item.completionDate, item.notes].filter(Boolean).join(" · "))}</p>${attachmentMarkup}</article>`,
      );
    }
  }

  const academicItems = [];
  for (const [key, item] of Object.entries(
    portfolio.supportingAcademics?.documents || {},
  )) {
    const attachmentMarkup = await renderAttachment(
      item,
      item.title || key,
      item.fileName || key,
      "Supporting academics",
    );
    if (item.description || item.fileRef || attachmentMarkup) {
      academicItems.push(
        `<article class="portfolio-entry"><h3>${esc(item.title || key)}</h3><p>${esc(item.description || "")}</p>${attachmentMarkup}</article>`,
      );
    }
  }

  const standards = [];
  for (const item of Object.values(portfolio.cewStandards || {})) {
    const evidence = [];
    for (const entry of item.evidence || []) {
      const attachmentMarkup = await renderAttachment(
        entry,
        entry.title || item.title || "CEW evidence",
        entry.fileName || entry.title || "CEW evidence",
        "CEW standards",
      );
      if (attachmentMarkup) evidence.push(attachmentMarkup);
    }
    if (item.explanation || item.description || evidence.length) {
      standards.push(
        `<article class="portfolio-entry"><h3>${esc(item.id || "CEW")}: ${esc(item.title || "Standard")}</h3><p>${esc(item.explanation || item.description || "")}</p>${evidence.join("")}</article>`,
      );
    }
  }

  const hiringDocuments = [];
  const hiringEntries = [
    ["Cover letter", portfolio.hiringDocuments?.coverLetter],
    ["Resume", portfolio.hiringDocuments?.resume],
    ["Standard application", portfolio.hiringDocuments?.standardApplication],
  ];
  for (const [label, value] of hiringEntries) {
    const attachmentMarkup = await renderAttachment(
      value,
      label,
      value?.fileName || label,
      "Hiring documents",
    );
    if (attachmentMarkup)
      hiringDocuments.push(
        `<article class="portfolio-entry"><h3>${esc(label)}</h3>${attachmentMarkup}</article>`,
      );
  }
  for (const [index, attachment] of (portfolio.hiringDocuments?.resume?.attachments || []).entries()) {
    const markup = await renderAttachment(attachment, `Resume attachment ${index + 1}`, attachment.fileName || "Resume attachment", "Hiring documents");
    if (markup)
      hiringDocuments.push(`<article class="portfolio-entry"><h3>Resume attachment ${index + 1}</h3>${markup}</article>`);
  }

  const toc = [
    ["About me", "about"],
    ["Hiring documents", "hiring-documents"],
    ["Work samples", "work-samples"],
    ["Industry credentials", "industry-credentials"],
    ["Awards", "accomplishments"],
    ["CareerSafe", "careersafe"],
    ["Supporting academics", "supporting-academics"],
    ["CEW standards", "cew-standards"],
  ]
    .map(
      ([label, id]) =>
        `<a href="#${id}"><span>${esc(label)}</span><span>${id}</span></a>`,
    )
    .join("");

  const content = `
    <section class="cover">
      <div class="cover-copy">
        <div class="brand">ECTS · CAREER PORTFOLIO</div>
        <h1>${esc(name || "Your Name")}</h1>
        <p class="career-goal">${esc(goal)}</p>
        <p class="bio">${esc(bio || "No biography added.")}</p>
        <div class="cover-meta"><span><small>PROGRAM</small><strong>${esc(program)}</strong></span><span><small>GRADUATION</small><strong>${esc(student.graduationYear || "")}</strong></span></div>
      </div>
      ${profileImage}
    </section>
    <nav class="table-of-contents" aria-label="Table of contents"><h2>Table of contents</h2><div>${toc}</div></nav>
    ${section("About me", `<p>${esc(bio || "No biography added.")}</p><p><strong>Skills:</strong> ${esc(skills || "Not entered")}</p><p><strong>Interests:</strong> ${esc(interests || "Not entered")}</p>${profileImage}`, "about")}
    ${section("Hiring documents", hiringDocuments.join(""), "hiring-documents")}
    ${section("Work samples", workSamples.join(""), "work-samples")}
    ${section("Industry credentials", credentials.join(""), "industry-credentials")}
    ${section("Awards", accomplishments.join(""), "accomplishments")}
    ${section("CareerSafe", careerSafe.join(""), "careersafe")}
    ${section("Supporting academics", academicItems.join(""), "supporting-academics")}
    ${section("CEW standards", standards.join(""), "cew-standards")}
    <footer class="page-footer"><span>${esc(name || "Student")} · ${esc(program)}</span><span>Page <span class="page-number"></span> of ${state.data?.totalPages || 1}</span></footer>`;

  document.getElementById("portfolio").innerHTML = content;
  window.__EXPORT_READY__ = true;
}

window.__EXPORT_RENDER__ = renderExport;
window.addEventListener("export-data-ready", () => {
  if (window.__EXPORT_DATA__) {
    renderExport(window.__EXPORT_DATA__).catch((error) => {
      console.error("Portfolio export render failed", error);
      document.getElementById("portfolio").innerHTML =
        `<div class="render-error">The portfolio could not be rendered. Please retry.</div>`;
    });
  }
});
