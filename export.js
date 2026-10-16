(() => {
  const renderExport = (data) => {
    const portfolio = data.portfolio || {};
    const attachments = data.attachments || {};
    const student = portfolio.student || {};
    const name =
      student.displayName ||
      [student.firstName, student.lastName].filter(Boolean).join(" ");
    const program = portfolio.program?.name || "Program not entered";
    const goal = portfolio.aboutMe?.careerGoal || "Future-ready professional";
    const bio = portfolio.aboutMe?.biography || "";
    const skills = (portfolio.aboutMe?.skills || []).map((skill) => typeof skill === "string" ? skill : skill?.name || "").filter(Boolean).join(", ");
    const interests = (portfolio.aboutMe?.interests || []).join(", ");
    const esc = (value) =>
      String(value || "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
    const attachment = (fileRef, label, fileName = "Attached document") => {
      const attachmentData = attachments[fileRef];
      if (!attachmentData)
        return `<div class="attachment"><p><strong>${esc(label)}</strong><br><span class="empty">Attachment is unavailable.</span></p></div>`;
      const mime = attachmentData.fileType || "application/octet-stream";
      const dataUrl = `data:${mime};base64,${attachmentData.base64}`;
      const extension = (fileName || "").toLowerCase().split(".").pop();
      if (mime.includes("pdf") || extension === "pdf") {
        return `<div class="attachment"><p><strong>${esc(label)}</strong><br>${esc(fileName)}</p><object data="${dataUrl}" type="application/pdf" width="100%" height="580px"><p>${esc(fileName)} could not be rendered inside the PDF.</p></object></div>`;
      }
      if (mime.startsWith("image/")) {
        return `<div class="attachment"><p><strong>${esc(label)}</strong><br>${esc(fileName)}</p><img src="${dataUrl}" alt="${esc(fileName)}"></div>`;
      }
      return `<div class="attachment"><p><strong>${esc(label)}</strong><br>${esc(fileName)}</p><div class="document-placeholder">This ${esc(extension.toUpperCase() || "document")} attachment is represented by its metadata because it is not directly printable from the PDF renderer.</div></div>`;
    };
    const fileObject = (value) =>
      value && typeof value === "object" && value.file ? value.file : value;
    const fileSection = (value, label) => {
      const file = fileObject(value);
      return file?.fileRef
        ? attachment(file.fileRef, label, file.fileName)
        : "";
    };
    const section = (heading, content) =>
      `<section class="section"><h2>${esc(heading)}</h2>${content}</section>`;
    const workSamples = (portfolio.workSamples || []).map((item, index) => {
      const file = fileSection(
        item.file,
        `Work sample ${index + 1}`,
        item.title,
      );
      return `<h3>${index + 1}. ${esc(item.title || "Work sample")}</h3><p>${esc(item.description || "")}</p>${file}`;
    });
    const credentials = (portfolio.credentials || []).map((item, index) => {
      const file = fileSection(
        item.file,
        item.name || `Credential ${index + 1}`,
        item.name,
      );
      return `<h3>${esc(item.name || `Credential ${index + 1}`)}</h3><p>${esc([item.organization, item.date, item.description].filter(Boolean).join(" · "))}</p>${file}`;
    });
    const accomplishments = [];
    for (const [kind, items] of Object.entries(
      portfolio.accomplishments || {},
    )) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const file = fileSection(
          item.file,
          item.title || item.name || kind,
          item.title || item.name,
        );
        accomplishments.push(
          `<h3>${esc(item.title || item.name || kind)}</h3><p>${esc(item.description || "")}</p>${file}`,
        );
      }
    }
    const careerSafe = (portfolio.careerSafe?.entries || []).map((item) => {
      const file = fileSection(
        item.certificate,
        item.selectedOption || "CareerSafe certificate",
        item.selectedOption,
      );
      return `<h3>${esc(item.selectedOption || "CareerSafe certification")}</h3><p>${esc([item.category, item.completionDate, item.notes].filter(Boolean).join(" · "))}</p>${file}`;
    });
    const academicItems = Object.values(
      portfolio.supportingAcademics?.documents || {},
    ).map((item) => {
      const file = fileSection(
        item,
        item.title || "Academic evidence",
        item.fileName,
      );
      return `<h3>${esc(item.title || "Academic evidence")}</h3><p>${esc(item.description || "")}</p>${file}`;
    });
    const standards = Object.values(portfolio.cewStandards || {}).map(
      (item) => {
        const evidence = (item.evidence || [])
          .map((entry) =>
            fileSection(entry, entry.title || item.title, entry.fileName),
          )
          .join("");
        return `<h3>${esc(item.id || "CEW")}: ${esc(item.title || "Standard")}</h3><p>${esc(item.explanation || item.description || "")}</p>${evidence}`;
      },
    );
    const hiring = [
      ["Cover letter", portfolio.hiringDocuments?.coverLetter],
      ["Resume", portfolio.hiringDocuments?.resume],
      ["Standard application", portfolio.hiringDocuments?.standardApplication],
    ]
      .map(([label, value]) => fileSection(value, label, value?.fileName))
      .join("");
    const profile = fileSection(
      student.profileImage,
      "Profile image",
      student.profileImage?.fileName,
    );
    const content = `
    <section class="cover"><div class="brand">ECTS · CAREER PORTFOLIO</div><h1>${esc(name || "Your Name")}</h1><div class="subtitle">${esc(goal)}</div><p>${esc(bio)}</p><div class="meta"><div><span>PROGRAM</span><strong>${esc(program)}</strong></div><div><span>GRADUATION</span><strong>${esc(student.graduationYear || "")}</strong></div></div></section>
    ${section("About me", `<p>${esc(bio || "No biography added.")}</p><p><strong>Skills:</strong> <span class="skills">${esc(skills || "Not entered")}</span></p><p><strong>Interests:</strong> <span class="interests">${esc(interests || "Not entered")}</span></p>${profile}`)}
    ${section("Hiring documents", hiring || `<p class="empty">No hiring documents attached.</p>`)}
    ${section("Work samples", workSamples.join("") || `<p class="empty">No work samples added.</p>`)}
    ${section("Industry credentials", credentials.join("") || `<p class="empty">No credentials added.</p>`)}
    ${section("Accomplishments", accomplishments.join("") || `<p class="empty">No accomplishments added.</p>`)}
    ${section("CareerSafe", careerSafe.join("") || `<p class="empty">No CareerSafe certifications added.</p>`)}
    ${section("Supporting academics", academicItems.join("") || `<p class="empty">No academic evidence added.</p>`)}
    ${section("CEW standards", standards.join("") || `<p class="empty">No CEW evidence added.</p>`)}
    <div class="footer">ECTS Career Portfolio Creator · ${esc(name || "Student")} · ${esc(program)}</div>`;
    document.getElementById("portfolio").innerHTML = content;
    document.getElementById("status").textContent =
      `${Object.keys(attachments).length} unique attachments prepared`;
  };
  window.__EXPORT_RENDER__ = renderExport;
  window.addEventListener("export-data-ready", () => {
    if (window.__EXPORT_DATA__) renderExport(window.__EXPORT_DATA__);
  });
})();
