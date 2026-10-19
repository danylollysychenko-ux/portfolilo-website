import * as pdfjsLib from "./node_modules/pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./node_modules/pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).href;

const state = {
  rendered: new Map(),
  attachmentMeta: new Map(),
};

const esc = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const asFile = (value) =>
  value && typeof value === "object" ? value.file || value : value;

const extensionOf = (value = "") =>
  String(value).toLowerCase().split(".").pop();

const attachmentMarkup = async (
  value,
  label,
  sectionKey = "default",
  options = {},
) => {
  const file = asFile(value);
  if (!file || !file.fileRef) return "";
  const attachment = window.__EXPORT_DATA__.attachments[file.fileRef];
  const fileName = attachment?.fileName || file.fileName || file.fileRef;
  const mime = attachment?.fileType || "";
  const extension = extensionOf(fileName);
  const sourceKey = file.fileRef;
  const renderedForSection = new Set(state.rendered.get(sectionKey) || []);
  const link = options.url || options.link || "";

  if (renderedForSection.has(sourceKey)) {
    return `<div class="attachment-reference">See: ${esc(options.referenceLabel || label)} — ${esc(fileName)}</div>`;
  }
  renderedForSection.add(sourceKey);
  state.rendered.set(sectionKey, renderedForSection);
  state.attachmentMeta.set(sourceKey, fileName);

  const cardClass =
    mime.includes("pdf") || extension === "pdf"
      ? "attachment-card--pdf"
      : mime.startsWith("image/")
        ? "attachment-card--image"
        : extension === "docx" || mime.includes("wordprocessingml")
          ? "attachment-card--docx"
          : "attachment-card--unsupported";

  if (mime.includes("pdf") || extension === "pdf") {
    try {
      const bytes = Uint8Array.from(atob(attachment.base64), (char) =>
        char.charCodeAt(0),
      );
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const sourceViewport = page.getViewport({ scale: 1 });
      const maxWidth = 4 * 96;
      const maxHeight = 4 * 96;
      const scale = Math.min(
        1.8,
        maxWidth / sourceViewport.width,
        maxHeight / sourceViewport.height,
      );
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      const linkMarkup = link
        ? `<a class="attachment-link" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Open project link</a>`
        : "";
      return `<div class="attachment-card ${cardClass}"><div class="attachment-preview"><img src="${canvas.toDataURL("image/png")}" alt="${esc(fileName)} first page"></div><div class="attachment-caption"><span class="attachment-status">First page shown</span>${linkMarkup}</div></div>`;
    } catch (error) {
      console.error("Attachment PDF render failed", fileName, error);
      return `<div class="attachment-card attachment-card--error"><div class="attachment-icon">!</div><div class="attachment-caption"><span class="attachment-status">Could not render attachment</span></div></div>`;
    }
  }

  if (mime.startsWith("image/")) {
    const image = `<img src="data:${mime};base64,${attachment.base64}" alt="${esc(fileName)}">`;
    if (label === "Profile photograph") return image;
    return `<div class="attachment-card ${cardClass}"><div class="attachment-preview">${image}</div><div class="attachment-caption"><span class="attachment-status">First page shown</span></div></div>`;
  }

  if (extension === "docx" || mime.includes("wordprocessingml")) {
    return `<div class="attachment-card attachment-card--docx"><div class="attachment-icon">DOCX</div><div class="attachment-caption"><span class="attachment-status">Document card — conversion unavailable</span></div></div>`;
  }

  return `<div class="attachment-card attachment-card--unsupported"><div class="attachment-icon">?</div><div class="attachment-caption"><span class="attachment-status">Unsupported attachment type</span></div></div>`;
};

const fileRefName = (value) => value;

const entry = (title, description, attachmentHTML, className = "") =>
  title || description || attachmentHTML
    ? `<article class="portfolio-entry ${className}"><h3>${esc(title)}</h3>${description ? `<p>${esc(description)}</p>` : ""}${attachmentHTML}</article>`
    : "";

const section = (id, heading, content, pageStart = false) =>
  content
    ? `<section class="export-section${pageStart ? " export-section--page-start" : ""}" id="${esc(id)}"><div class="section-divider"><span>${["hiring-documents", "work-samples", "industry-credentials"].includes(id) ? "SECTION 1" : "ECTS CAREER PORTFOLIO"}</span><span>${esc(heading)}</span></div><h2>${esc(heading)}</h2>${content}</section>`
    : "";

async function renderExport(data) {
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
  const profile = asFile(student.profileImage);
  const profileImage = profile?.fileRef
    ? await attachmentMarkup(
        student.profileImage,
        "Profile photograph",
        "About me",
      )
    : "";
  const profilePhoto = profileImage
    ? `<div class="profile-photo">${profileImage}</div>`
    : "";

  const workSamples = [];
  const sampleItems = (portfolio.workSamples || []).filter(
    (item) =>
      item &&
      window.PortfolioQuality.publicRecord(item, "workSample") &&
      (item.title ||
        item.description ||
        item.reflection ||
        item.link ||
        asFile(item.file)?.fileRef),
  );
  for (const [index, item] of sampleItems.entries()) {
    const attachment = await attachmentMarkup(
      item.file,
      item.title || `Work sample ${index + 1}`,
      "Work samples",
    );
    workSamples.push(
      entry(
        item.title || `Work sample ${index + 1}`,
        item.description || "",
        attachment,
      ),
    );
  }

  const credentials = [];
  const credentialItems = (portfolio.credentials || []).filter(
    (item) =>
      item &&
      window.PortfolioQuality.publicRecord(item, "credential") &&
      (item.name ||
        item.organization ||
        item.date ||
        item.description ||
        asFile(item.file)?.fileRef),
  );
  for (const item of credentialItems) {
    const attachment = await attachmentMarkup(
      item.file,
      item.name || "Industry credential",
      "Industry credentials",
    );
    credentials.push(
      entry(
        item.name || "Industry credential",
        [item.organization, item.date, item.description]
          .filter(Boolean)
          .join(" · "),
        attachment,
      ),
    );
  }

  const accomplishments = [];
  for (const [kind, items] of Object.entries(portfolio.accomplishments || {})) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!window.PortfolioQuality.publicRecord(item, "achievement")) continue;
      const attachment = await attachmentMarkup(
        item.file,
        item.title || item.name || kind,
        kind,
      );
      accomplishments.push(
        entry(
          item.title || item.name || kind,
          item.description || "",
          attachment,
        ),
      );
    }
  }

  const careerSafe = [];
  const careerSafeRecords = Array.isArray(portfolio.careerSafe?.entries)
    ? portfolio.careerSafe.entries
    : Object.entries(portfolio.careerSafe || {}).filter(([key]) => /^careerSafe\d+$/.test(key)).map(([, item]) => item);
  for (const item of careerSafeRecords) {
    if (!window.PortfolioQuality.publicRecord({ ...item, title: item?.selectedOption }, "careerSafe")) continue;
    if (!item?.selectedOption && !item?.certificate?.fileRef) continue;
    const attachment = await attachmentMarkup(
      item.certificate,
      item.selectedOption || "CareerSafe certification",
      "CareerSafe",
    );
    careerSafe.push(
      entry(
        item.selectedOption || "CareerSafe certification",
        [item.category, item.completionDate, item.notes]
          .filter(Boolean)
          .join(" · "),
        attachment,
      ),
    );
  }

  const academicItems = [];
  for (const [key, item] of Object.entries(
    portfolio.supportingAcademics?.documents || {},
  )) {
    if (!window.PortfolioQuality.publicRecord(item, "academic")) continue;
    const attachment = await attachmentMarkup(
      item,
      item.title || key,
      "Supporting academics",
    );
    academicItems.push(
      entry(item.title || key, item.description || "", attachment),
    );
  }

  const standards = [];
  for (const item of Object.values(portfolio.cewStandards || {})) {
    const attachmentHTML = [];
    for (const evidence of item.evidence || []) {
      attachmentHTML.push(
        await attachmentMarkup(
          evidence,
          evidence.title || item.title || "CEW evidence",
          "CEW standards",
        ),
      );
    }
    standards.push(
      entry(
        `${item.id || "CEW"}: ${item.title || "Standard"}`,
        item.explanation || item.description || "",
        attachmentHTML.join(""),
      ),
    );
  }

  const hiringDocuments = [];
  for (const [label, value] of [
    ["Cover letter", portfolio.hiringDocuments?.coverLetter],
    ["Resume", portfolio.hiringDocuments?.resume],
    ["Standard application", portfolio.hiringDocuments?.standardApplication],
  ]) {
    if (value?.publicationStatus !== "published") continue;
    const attachment = await attachmentMarkup(value, label, "Hiring documents");
    if (attachment)
      hiringDocuments.push(
        entry(
          label,
          label === "Resume"
            ? ""
            : "",
          attachment,
          "document-entry",
        ),
      );
  }
  for (const [index, attachment] of (portfolio.hiringDocuments?.resume?.publicationStatus === "published" ? portfolio.hiringDocuments.resume.attachments || [] : []).entries()) {
    const markup = await attachmentMarkup(attachment, `Resume attachment ${index + 1}`, "Hiring documents");
    if (markup) hiringDocuments.push(entry(`Resume attachment ${index + 1}`, "", markup, "document-entry"));
  }

  const recommendations = [];
  for (const [index, item] of (portfolio.recommendations || []).entries()) {
    if (!window.PortfolioQuality.publicRecord(item, "recommendation")) continue;
    const attachment = await attachmentMarkup(item.file || item, item.authorName || `Recommendation ${index + 1}`, "Recommendations");
    recommendations.push(entry(item.authorName || `Recommendation ${index + 1}`, [item.relationship, item.date].filter(Boolean).join(" \u00b7 "), attachment));
  }

  const tocEntries = [
    ["About Me", "about"],
    ["Hiring Documents", "hiring-documents"],
    ["Work Samples", "work-samples"],
    ["Industry Credentials", "industry-credentials"],
    ["Accomplishments", "accomplishments"],
    ["Recommendation Letters", "recommendations"],
    ["CareerSafe Certifications", "careersafe"],
    ["Supporting Academics", "supporting-academics"],
    ["CEW Standards", "cew-standards"],
  ].filter(([, id]) => {
    if (id === "about") return true;
    if (id === "hiring-documents") return true;
    if (id === "work-samples") return true;
    if (id === "industry-credentials") return true;
    if (id === "accomplishments") return accomplishments.length > 0;
    if (id === "recommendations") return recommendations.length > 0;
    if (id === "careersafe") return careerSafe.length > 0;
    if (id === "supporting-academics") return academicItems.length > 0;
    if (id === "cew-standards") return standards.length > 0;
    return false;
  });
  const toc = tocEntries
    .map(([label, id]) => `<a href="#${id}">${esc(label)}</a>`)
    .join("");
  const hasFile = (value) => Boolean(value?.publicationStatus === "published" && asFile(value)?.fileRef);
  const checklistItems = [
    {
      label: "About Me introduction",
      status: name || bio ? "Ready" : "Add details",
      complete: Boolean(name || bio),
      target: "about",
    },
    {
      label: "Cover letter",
      status: hasFile(portfolio.hiringDocuments?.coverLetter)
        ? "On file"
        : "Add file",
      complete: hasFile(portfolio.hiringDocuments?.coverLetter),
      target: "hiring-documents",
    },
    {
      label: "Resume",
      status: hasFile(portfolio.hiringDocuments?.resume)
        ? "On file"
        : "Add file",
      complete: hasFile(portfolio.hiringDocuments?.resume),
      target: "hiring-documents",
    },
    {
      label: "Resume updated within 3 months",
      status: "Verify date",
      complete: false,
      target: "hiring-documents",
    },
    {
      label: "Work samples",
      status: `${sampleItems.length}/5 minimum`,
      complete: sampleItems.length >= 5,
      target: "work-samples",
    },
    {
      label: "Industry-recognized credentials",
      status: credentialItems.length
        ? `${credentialItems.length} added`
        : "Add credential",
      complete: credentialItems.length > 0,
      target: "industry-credentials",
    },
  ];
  const checklist = checklistItems
    .map(
      ({ label, status, complete, target }) =>
        `<li class="checklist-item${complete ? " checklist-item--complete" : ""}"><a href="#${target}">${esc(label)}</a><span>${esc(status)}</span></li>`,
    )
    .join("");

  const content = `
    <section class="cover" id="about">
      <div class="cover-copy">
        <div class="brand">ECTS · CAREER PORTFOLIO</div>
        <div class="intro-label">INTRODUCTION · ABOUT ME</div>
        <h1>${esc(name || "Your Name")}</h1>
        <p class="career-goal">${esc(goal)}</p>
        <p class="bio">${esc(bio)}</p>
        <p class="profile-strengths"><strong>Skills:</strong> ${esc(skills || "Not entered")}<br><strong>Interests:</strong> ${esc(interests || "Not entered")}</p>
        <div class="cover-meta"><span><small>PROGRAM</small><strong>${esc(program)}</strong></span><span><small>GRADUATION</small><strong>${esc(student.graduationYear || "")}</strong></span></div>
      </div>
      ${profilePhoto}
    </section>
    <nav class="table-of-contents">
      <div class="contents-heading"><div><span>PORTFOLIO GUIDE</span><h2>Contents & checklist</h2></div><p>Use the contents to jump to a section. Check the requirements before sharing your portfolio.</p></div>
      <div class="contents-layout">
        <div class="contents-links"><h3>Contents</h3><div>${toc}</div></div>
        <div class="portfolio-checklist"><h3>Section 1 checklist</h3><ul>${checklist}</ul></div>
      </div>
    </nav>
    ${section("hiring-documents", "Hiring Documents", hiringDocuments.join("") || '<p class="empty section-empty">Add your cover letter and current resume here.</p>', true)}
    ${section("work-samples", "Work Samples", `<p class="section-intro">Include at least five samples that show your range and the skills you used.</p>${workSamples.join("") || '<p class="empty section-empty">Add at least five work samples to complete this section.</p>'}`, true)}
    ${section("industry-credentials", "Industry Credentials", `<p class="section-intro">List each credential with its issuing organization and date.</p>${credentials.join("") || '<p class="empty section-empty">Add industry-recognized certifications, badges, or licenses here.</p>'}`, true)}
    ${section("accomplishments", "Accomplishments", accomplishments.join(""))}
    ${section("recommendations", "Recommendation Letters", recommendations.join(""))}
    ${section("careersafe", "CareerSafe Certifications", careerSafe.join(""))}
    ${section("supporting-academics", "Supporting Academics", academicItems.join(""))}
    ${section("cew-standards", "CEW Standards", standards.join(""))}`;

  document.getElementById("portfolio").innerHTML = content;
  window.__EXPORT_READY__ = true;
}

window.__EXPORT_RENDER__ = renderExport;
window.addEventListener("export-data-ready", () => {
  if (!window.__EXPORT_DATA__) return;
  renderExport(window.__EXPORT_DATA__).catch((error) => {
    console.error("Portfolio export render failed", error);
    document.getElementById("portfolio").innerHTML =
      '<div class="render-error">The portfolio could not be rendered. Please retry.</div>';
  });
});
