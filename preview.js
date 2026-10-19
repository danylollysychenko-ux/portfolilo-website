import "./document-preview.js";

function renderAboutMe(portfolio = {}) {
  const student = portfolio.student || {};
  const about = portfolio.aboutMe || {};
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim()
    || student.displayName || "Your name";
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "—";
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  setText("name", fullName);
  setText("monogram", initials);
  if (student.profileImage?.previewDataUrl) {
    const image = document.createElement("img");
    image.className = "profile-photo";
    image.src = student.profileImage.previewDataUrl;
    image.alt = `${fullName} profile`;
    document.getElementById("monogram").replaceWith(image);
  }
  setText("goal", about.careerGoal || "");
  document.getElementById("goal").classList.toggle("hidden", !about.careerGoal);
  const meta = [portfolio.program?.name, student.graduationYear ? `Class of ${student.graduationYear}` : ""].filter(Boolean).join(" · ");
  setText("meta", meta);
  document.getElementById("meta").classList.toggle("hidden", !meta);
  setText("biography", about.biography || "");
  document.getElementById("biography-section").classList.toggle("hidden", !about.biography);
  setText("additional", about.additionalInformation || "");
  document.getElementById("additional-section").classList.toggle("hidden", !about.additionalInformation);
  setText("footer-name", fullName);
  setText("contents-footer-name", fullName);
  const sections = Array.isArray(portfolio.tableOfContents) && portfolio.tableOfContents.length
    ? portfolio.tableOfContents
    : [
        { label: "About Me", target: "about-me" },
        { label: "Portfolio Checklist", target: "portfolio-checklist" },
        { label: "Cover Letter", target: "cover-letter" },
        { label: "Resume", target: "resume" },
        { label: "Standard Application for Employment", target: "standard-application" },
        { label: "Work Samples", target: "work-samples" },
        { label: "Industry Credentials", target: "industry-credentials" },
        { label: "Accomplishments", target: "accomplishments" },
        { label: "Recommendation Letters", target: "recommendations" },
        { label: "CareerSafe Certifications", target: "careersafe" },
        { label: "Supporting Academics", target: "supporting-academics" },
        { label: "CEW Standards", target: "cew-standards" },
      ];
  const contents = document.getElementById("contents-list");
  contents.replaceChildren(...sections.map(({ label, target }) => {
    const item = document.createElement("li");
    item.dataset.target = target;
    const destination = document.getElementById(target) || [
      "recommendations",
      "cover-letter",
      "resume",
      "standard-application",
    ].includes(target);
    const labelElement = destination ? document.createElement("a") : document.createElement("span");
    if (destination) labelElement.href = `#${target}`;
    labelElement.textContent = label;
    const pageNumber = document.createElement("span");
    pageNumber.className = "page-number";
    pageNumber.textContent = "—";
    const leader = document.createElement("span");
    leader.className = "contents-leader";
    leader.setAttribute("aria-hidden", "true");
    item.append(labelElement, leader, pageNumber);
    return item;
  }));
  for (const [key, elementId] of [["skills", "skills"], ["interests", "interests"]]) {
    const values = Array.isArray(about[key])
      ? about[key].map((value) => typeof value === "string" ? value : value?.name || "").filter(Boolean)
      : [];
    const list = document.getElementById(elementId);
    list.replaceChildren(...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }));
    document.getElementById(`${key}-section`).classList.toggle("hidden", values.length === 0);
  }
  document.title = `${fullName} | About Me`;
}

window.addEventListener("about-me-data-ready", () => {
  const portfolio = window.__ABOUT_ME_DATA__ || {};
  window.__PREVIEW_READY__ = (async () => {
    try {
      renderAboutMe(portfolio);
      await renderHiringDocuments(portfolio);
      await renderWorkSamples(portfolio);
      await renderCredentials(portfolio);
      renderAccomplishments(portfolio);
      await renderCareerSafe(portfolio);
      await renderSupportingAcademics(portfolio);
      renderCewStandards(portfolio);
    } catch (error) {
      console.error("Portfolio preview could not be fully rendered.", error);
    } finally {
      updateContentsPageNumbers();
    }
  })();
});

function documentFile(value) {
  if (!value || typeof value !== "object") return value;
  return value.file && typeof value.file === "object" ? value.file : value;
}

async function renderHiringDocuments(portfolio) {
  const entries = [];
  const coverLetter = documentFile(portfolio.hiringDocuments?.coverLetter);
  const resume = documentFile(portfolio.hiringDocuments?.resume);
  const standardApplication = documentFile(
    portfolio.hiringDocuments?.standardApplication,
  );
  const employmentApplication = documentFile(
    portfolio.supportingAcademics?.documents?.employment,
  );
  const applicationFile = standardApplication?.fileRef || standardApplication?.fileName
    ? standardApplication
    : employmentApplication;
  if (coverLetter?.fileRef || coverLetter?.fileName)
    entries.push({ title: "Cover Letter", file: coverLetter });
  if (resume?.fileRef || resume?.fileName)
    entries.push({ title: "Resume", file: resume });
  for (const [index, attachment] of (portfolio.hiringDocuments?.resume?.attachments || []).entries()) {
    const file = documentFile(attachment);
    if (file?.fileRef || file?.fileName)
      entries.push({ title: `Resume attachment ${index + 1}`, file });
  }
  if (applicationFile?.fileRef || applicationFile?.fileName)
    entries.push({ title: "Standard Application", file: applicationFile });
  for (const [index, recommendation] of (portfolio.recommendations || []).entries()) {
    const file = documentFile(recommendation?.file || recommendation);
    if (file?.fileRef || file?.fileName)
      entries.push({
        title: recommendation?.authorName
          ? `Recommendation Letter · ${recommendation.authorName}`
          : `Recommendation Letter ${index + 1}`,
        file,
      });
  }

  const list = document.getElementById("document-list");
  document.getElementById("documents-footer-name").textContent =
    document.getElementById("footer-name").textContent;
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No hiring documents have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...entries.map(({ title, file }, index) => {
    const card = document.createElement("article");
    card.className = "document-card";
    if (title === "Cover Letter") card.id = "cover-letter";
    else if (title === "Resume") card.id = "resume";
    else if (title === "Standard Application") card.id = "standard-application";
    else if (
      title.startsWith("Recommendation Letter") &&
      !document.getElementById("recommendations")
    )
      card.id = "recommendations";
    const heading = document.createElement("header");
    heading.className = "document-card-heading";
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    const fileName = document.createElement("span");
    fileName.className = "document-file-name";
    fileName.textContent = file.fileName || "Attached document";
    heading.append(titleElement, fileName);
    const pages = document.createElement("div");
    pages.className = "document-pages";
    pages.id = `document-pages-${index + 1}`;
    card.append(heading, pages);
    return card;
  }));

  for (const [index, { file }] of entries.entries()) {
    const target = document.getElementById(`document-pages-${index + 1}`);
    const attachment = portfolio.previewAttachments?.[file.fileRef];
    if (!attachment?.base64) {
      target.textContent = "The attached file could not be loaded for preview.";
      target.classList.add("document-error");
      continue;
    }
    const bytes = Uint8Array.from(atob(attachment.base64), (character) => character.charCodeAt(0));
    try {
      await window.documentRenderer.render(
        {
          bytes,
          fileName: attachment.fileName || file.fileName,
          fileType: attachment.fileType || file.fileType,
        },
        target,
      );
    } catch (error) {
      target.textContent = error.message || "This document could not be previewed.";
      target.classList.add("document-error");
    }
  }
}

async function renderWorkSamples(portfolio) {
  const samples = Array.isArray(portfolio.workSamples) ? portfolio.workSamples : [];
  const list = document.getElementById("work-sample-list");
  document.getElementById("work-samples-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  if (!samples.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No work samples have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  const cards = samples.map((sample, index) => {
    const card = document.createElement("article");
    card.className = "work-sample-card";

    const heading = document.createElement("header");
    heading.className = "work-sample-heading";
    const title = document.createElement("h2");
    title.textContent = sample.title?.trim() || `Work Sample ${index + 1}`;
    heading.append(title);

    const metadata = [sample.classOrProject, sample.date].filter(Boolean);
    if (metadata.length) {
      const meta = document.createElement("p");
      meta.className = "work-sample-meta";
      meta.textContent = metadata.join(" · ");
      heading.append(meta);
    }
    card.append(heading);

    if (sample.description?.trim()) {
      const description = document.createElement("p");
      description.className = "work-sample-description";
      description.textContent = sample.description.trim();
      card.append(description);
    }

    const skillsById = new Map((portfolio.aboutMe?.skills || []).map((skill) => [skill.id, skill.name]));
    const skills = Array.isArray(sample.skills)
      ? [...sample.skills.map((skill) => skillsById.get(skill) || (typeof skill === "string" ? skill : "")).filter(Boolean), ...(sample.unmatchedSkills || [])]
      : String(sample.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean);
    if (skills.length) {
      const skillList = document.createElement("ul");
      skillList.className = "chips work-sample-skills";
      skillList.replaceChildren(...skills.map((skill) => {
        const item = document.createElement("li");
        item.textContent = skill;
        return item;
      }));
      card.append(skillList);
    }

    if (sample.reflection?.trim()) {
      const reflection = document.createElement("p");
      reflection.className = "work-sample-reflection";
      const label = document.createElement("strong");
      label.textContent = "Reflection: ";
      reflection.append(label, document.createTextNode(sample.reflection.trim()));
      card.append(reflection);
    }

    if (sample.link?.trim()) {
      try {
        const link = new URL(sample.link.trim());
        if (["http:", "https:"].includes(link.protocol)) {
          const linkElement = document.createElement("a");
          linkElement.className = "work-sample-link";
          linkElement.href = link.href;
          linkElement.target = "_blank";
          linkElement.rel = "noopener noreferrer";
          linkElement.textContent = "Open project link";
          card.append(linkElement);
        }
      } catch {}
    }

    const attachment = document.createElement("div");
    attachment.className = "document-pages work-sample-attachment";
    if (sample.file?.fileRef || sample.file?.fileName) {
      const file = documentFile(sample.file);
      attachment.dataset.fileRef = file.fileRef || "";
      attachment.dataset.fileName = file.fileName || "";
      if (file.fileRef) attachment.classList.add("work-sample-has-file");
      else attachment.textContent = "The attached file is missing its file reference.";
    } else {
      attachment.textContent = "No file attached.";
      attachment.classList.add("work-sample-no-file");
    }
    card.append(attachment);
    return card;
  });

  list.replaceChildren(...cards);
  for (const [index, sample] of samples.entries()) {
    const target = list.children[index].querySelector(".work-sample-attachment");
    const file = documentFile(sample.file);
    if (!file?.fileRef) continue;
    const attachment = portfolio.previewAttachments?.[file.fileRef];
    if (!attachment?.base64) {
      target.textContent = "The attached file could not be loaded for preview.";
      target.classList.add("document-error");
      continue;
    }
    const bytes = Uint8Array.from(atob(attachment.base64), (character) => character.charCodeAt(0));
    try {
      await window.documentRenderer.render(
        {
          bytes,
          fileName: attachment.fileName || file.fileName,
          fileType: attachment.fileType || file.fileType,
        },
        target,
      );
    } catch (error) {
      target.textContent = error.message || "This work sample could not be previewed.";
      target.classList.add("document-error");
    }
  }
}

async function renderCredentials(portfolio) {
  const credentials = Array.isArray(portfolio.credentials) ? portfolio.credentials : [];
  const list = document.getElementById("credential-list");
  document.getElementById("credentials-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  if (!credentials.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No industry credentials have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  const cards = credentials.map((credential, index) => {
    const card = document.createElement("article");
    card.className = "credential-card";
    const heading = document.createElement("header");
    heading.className = "work-sample-heading";
    const title = document.createElement("h2");
    title.textContent = credential.name?.trim() || `Credential ${index + 1}`;
    heading.append(title);
    const metadata = [credential.organization, credential.date].filter(Boolean);
    if (metadata.length) {
      const meta = document.createElement("p");
      meta.className = "work-sample-meta";
      meta.textContent = metadata.join(" · ");
      heading.append(meta);
    }
    card.append(heading);

    if (credential.description?.trim()) {
      const description = document.createElement("p");
      description.className = "work-sample-description";
      description.textContent = credential.description.trim();
      card.append(description);
    }

    const attachment = document.createElement("div");
    attachment.className = "document-pages credential-attachment";
    const file = documentFile(credential.file);
    if (file?.fileRef) {
      attachment.dataset.fileRef = file.fileRef;
      attachment.classList.add("credential-has-file");
    } else {
      attachment.textContent = file?.fileName
        ? `Certificate file unavailable: ${file.fileName}`
        : "No certificate file attached.";
      attachment.classList.add("work-sample-no-file");
    }
    card.append(attachment);
    return card;
  });
  list.replaceChildren(...cards);

  for (const [index, credential] of credentials.entries()) {
    const target = list.children[index].querySelector(".credential-attachment");
    const file = documentFile(credential.file);
    if (!file?.fileRef) continue;
    const attachment = portfolio.previewAttachments?.[file.fileRef];
    if (!attachment?.base64) {
      target.textContent = "The certificate file could not be loaded for preview.";
      target.classList.add("document-error");
      continue;
    }
    const bytes = Uint8Array.from(atob(attachment.base64), (character) => character.charCodeAt(0));
    try {
      await window.documentRenderer.render(
        {
          bytes,
          fileName: attachment.fileName || file.fileName,
          fileType: attachment.fileType || file.fileType,
        },
        target,
      );
    } catch (error) {
      target.textContent = error.message || "This certificate could not be previewed.";
      target.classList.add("document-error");
    }
  }
}

function renderAccomplishments(portfolio) {
  const data = portfolio.accomplishments || {};
  const groups = [
    ["awards", "Awards"],
    ["accomplishments", "Accomplishments"],
    ["extracurriculars", "Extracurricular Activities"],
    ["serviceExperiences", "Service Experiences"],
  ];
  const list = document.getElementById("accomplishment-list");
  document.getElementById("accomplishments-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  const populatedGroups = groups.map(([key, title]) => ({
    title,
    entries: Array.isArray(data[key]) ? data[key].filter(Boolean) : [],
  })).filter((group) => group.entries.length);

  if (!populatedGroups.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No accomplishments have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...populatedGroups.map(({ title, entries }) => {
    const group = document.createElement("section");
    group.className = "accomplishment-group";
    const heading = document.createElement("h2");
    heading.textContent = title;
    group.append(heading);
    const cards = entries.map((entry, index) => {
      const item = typeof entry === "string" ? { title: entry } : entry;
      const card = document.createElement("article");
      card.className = "accomplishment-card";
      const itemTitle = document.createElement("h3");
      itemTitle.textContent = item.title?.trim() || `${title} ${index + 1}`;
      card.append(itemTitle);
      const metadata = [item.organization, item.date].filter(Boolean);
      if (metadata.length) {
        const meta = document.createElement("p");
        meta.className = "work-sample-meta";
        meta.textContent = metadata.join(" · ");
        card.append(meta);
      }
      if (item.description?.trim()) {
        const description = document.createElement("p");
        description.className = "work-sample-description";
        description.textContent = item.description.trim();
        card.append(description);
      }
      return card;
    });
    group.append(...cards);
    return group;
  }));
}

async function renderCareerSafe(portfolio) {
  const data = portfolio.careerSafe || {};
  const entries = Array.isArray(data.entries)
    ? data.entries
    : Object.entries(data)
        .filter(([key]) => /^careerSafe\d+$/.test(key))
        .map(([, entry], index) => ({ ...entry, category: String(index + 1) }));
  const list = document.getElementById("careersafe-list");
  document.getElementById("careersafe-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No CareerSafe certifications have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...entries.map((entry, index) => {
    const card = document.createElement("article");
    card.className = "careersafe-card";
    const heading = document.createElement("header");
    heading.className = "work-sample-heading";
    const title = document.createElement("h2");
    title.textContent = entry.selectedOption?.trim() || `Certification ${index + 1}`;
    heading.append(title);
    const metadata = [];
    if (entry.category) metadata.push(`CareerSafe ${entry.category}`);
    if (entry.completionDate) metadata.push(entry.completionDate);
    if (metadata.length) {
      const meta = document.createElement("p");
      meta.className = "work-sample-meta";
      meta.textContent = metadata.join(" · ");
      heading.append(meta);
    }
    card.append(heading);

    if (entry.notes?.trim()) {
      const notes = document.createElement("p");
      notes.className = "work-sample-description";
      notes.textContent = entry.notes.trim();
      card.append(notes);
    }

    const attachment = document.createElement("div");
    attachment.className = "document-pages careersafe-attachment";
    const file = documentFile(entry.certificate);
    if (file?.fileRef) {
      attachment.dataset.fileRef = file.fileRef;
    } else {
      attachment.textContent = file?.fileName
        ? `Certificate file unavailable: ${file.fileName}`
        : "No certificate file attached.";
      attachment.classList.add("work-sample-no-file");
    }
    card.append(attachment);
    return card;
  }));

  for (const [index, entry] of entries.entries()) {
    const target = list.children[index].querySelector(".careersafe-attachment");
    const file = documentFile(entry.certificate);
    if (!file?.fileRef) continue;
    const attachment = portfolio.previewAttachments?.[file.fileRef];
    if (!attachment?.base64) {
      target.textContent = "The certificate file could not be loaded for preview.";
      target.classList.add("document-error");
      continue;
    }
    const bytes = Uint8Array.from(atob(attachment.base64), (character) => character.charCodeAt(0));
    try {
      await window.documentRenderer.render(
        {
          bytes,
          fileName: attachment.fileName || file.fileName,
          fileType: attachment.fileType || file.fileType,
        },
        target,
      );
    } catch (error) {
      target.textContent = error.message || "This CareerSafe certificate could not be previewed.";
      target.classList.add("document-error");
    }
  }
}

async function renderSupportingAcademics(portfolio) {
  const academics = portfolio.supportingAcademics || {};
  const documents = academics.documents || {};
  const documentTypes = [
    ["postSecondary", "Post-secondary Plan"],
    ["growth", "Co-op / SkillsUSA / ECTS Growth Reflection"],
    ["reflection1", "ATD / Field Trip Reflection 1"],
    ["reflection2", "ATD / Field Trip Reflection 2"],
    ["employment", "Standard Application for Employment"],
    ["employers", "Potential Employers"],
    ["education", "Post-secondary Education Opportunities"],
    ["home", "Home School Reflection"],
  ];
  const list = document.getElementById("academics-list");
  document.getElementById("academics-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  const entries = documentTypes.map(([key, title]) => ({
    title,
    record: documents[key],
  })).filter(({ record }) => {
    const file = documentFile(record);
    return Boolean(file?.fileRef || file?.fileName || record?.description?.trim());
  });

  const checkoffs = [
    ["Instructional Assistant", academics.instructionalAssistant],
    ["Instructor", academics.instructor],
  ].filter(([, person]) => person?.name || person?.date);

  if (!entries.length && !checkoffs.length) {
    const empty = document.createElement("div");
    empty.className = "documents-empty";
    empty.textContent = "No supporting academic documents have been added yet.";
    list.replaceChildren(empty);
    return;
  }

  const cards = entries.map(({ title, record }) => {
    const card = document.createElement("article");
    card.className = "academic-document-card";
    const heading = document.createElement("header");
    heading.className = "work-sample-heading";
    const titleElement = document.createElement("h2");
    titleElement.textContent = title;
    heading.append(titleElement);
    card.append(heading);
    if (record.description?.trim()) {
      const description = document.createElement("p");
      description.className = "work-sample-description";
      description.textContent = record.description.trim();
      card.append(description);
    }
    const file = documentFile(record);
    const attachment = document.createElement("div");
    attachment.className = "document-pages academic-attachment";
    if (file?.fileRef) {
      attachment.dataset.fileRef = file.fileRef;
    } else {
      attachment.textContent = file?.fileName
        ? `File unavailable: ${file.fileName}`
        : "No file attached.";
      attachment.classList.add("work-sample-no-file");
    }
    card.append(attachment);
    return card;
  });

  if (checkoffs.length) {
    const card = document.createElement("article");
    card.className = "academic-checkoffs-card";
    const heading = document.createElement("h2");
    heading.textContent = "Portfolio Checkoffs";
    card.append(heading);
    for (const [role, person] of checkoffs) {
      const line = document.createElement("p");
      line.className = "academic-checkoff-line";
      line.textContent = [role, person.name, person.date].filter(Boolean).join(" · ");
      card.append(line);
    }
    cards.push(card);
  }

  list.replaceChildren(...cards);
  for (const [index, { record }] of entries.entries()) {
    const target = list.children[index].querySelector(".academic-attachment");
    const file = documentFile(record);
    if (!file?.fileRef) continue;
    const attachment = portfolio.previewAttachments?.[file.fileRef];
    if (!attachment?.base64) {
      target.textContent = "The academic document could not be loaded for preview.";
      target.classList.add("document-error");
      continue;
    }
    const bytes = Uint8Array.from(atob(attachment.base64), (character) => character.charCodeAt(0));
    try {
      await window.documentRenderer.render(
        {
          bytes,
          fileName: attachment.fileName || file.fileName,
          fileType: attachment.fileType || file.fileType,
        },
        target,
      );
    } catch (error) {
      target.textContent = error.message || "This academic document could not be previewed.";
      target.classList.add("document-error");
    }
  }
}

function renderCewStandards(portfolio) {
  const standards = portfolio.cewStandards || {};
  const definitions = [
    ["standard131", "13.1", "Career Awareness & Exploration"],
    ["standard132", "13.2", "Employability Skills"],
    ["standard133", "13.3", "Growth & Advancement"],
    ["standard134", "13.4", "Personal Interests & Career Planning"],
  ];
  const list = document.getElementById("cew-list");
  document.getElementById("cew-footer-name").textContent =
    document.getElementById("footer-name").textContent;

  list.replaceChildren(...definitions.map(([key, id, title]) => {
    const standard = standards[key] || {};
    const card = document.createElement("article");
    card.className = "cew-standard-card";
    const heading = document.createElement("header");
    heading.className = "work-sample-heading";
    const headingTitle = document.createElement("h2");
    headingTitle.textContent = `${id} · ${standard.title || title}`;
    heading.append(headingTitle);
    card.append(heading);

    const evidence = Array.isArray(standard.evidence) ? standard.evidence : [];
    const evidenceLabels = evidence.map((item) =>
      typeof item === "string" ? item : item?.portfolioItemType,
    ).filter(Boolean);
    const evidenceHeading = document.createElement("p");
    evidenceHeading.className = "cew-evidence-label";
    evidenceHeading.textContent = "Portfolio evidence";
    card.append(evidenceHeading);

    if (evidenceLabels.length) {
      const chips = document.createElement("ul");
      chips.className = "chips cew-evidence-list";
      chips.replaceChildren(...evidenceLabels.map((label) => {
        const item = document.createElement("li");
        item.textContent = label;
        return item;
      }));
      card.append(chips);
    } else {
      const none = document.createElement("p");
      none.className = "cew-empty-evidence";
      none.textContent = "No evidence selected yet.";
      card.append(none);
    }

    for (const item of evidence) {
      if (typeof item !== "object" || !item.description?.trim()) continue;
      const evidenceNote = document.createElement("p");
      evidenceNote.className = "cew-evidence-note";
      const label = document.createElement("strong");
      label.textContent = `${item.portfolioItemType || "Evidence"}: `;
      evidenceNote.append(label, document.createTextNode(item.description.trim()));
      card.append(evidenceNote);
    }

    const explanation = (standard.explanation || standard.description || "").trim();
    if (explanation) {
      const paragraph = document.createElement("p");
      paragraph.className = "work-sample-description cew-explanation";
      paragraph.textContent = explanation;
      card.append(paragraph);
    }
    return card;
  }));
}

function attachmentPageCount(container) {
  if (!container) return 1;
  return Math.max(
    1,
    container.querySelectorAll(".pdf-page-wrapper").length,
    container.querySelectorAll(".docx").length,
    container.querySelectorAll("img.attachment-image").length,
  );
}

function countCardPages(sheet, cardSelector, attachmentSelector) {
  const cards = [...sheet.querySelectorAll(cardSelector)];
  if (!cards.length) return 1;
  return cards.reduce((total, card) => {
    const attachment = card.querySelector(attachmentSelector);
    return total + attachmentPageCount(attachment);
  }, 0);
}

function estimateFlowPages(sheet) {
  return Math.max(1, Math.ceil(sheet.scrollHeight / 1018));
}

function sheetPageCount(sheet) {
  switch (sheet.id) {
    case "hiring-documents":
      return countCardPages(sheet, ".document-card", ".document-pages");
    case "work-samples":
      return countCardPages(sheet, ".work-sample-card", ".work-sample-attachment");
    case "industry-credentials":
      return countCardPages(sheet, ".credential-card", ".credential-attachment");
    case "careersafe":
      return countCardPages(sheet, ".careersafe-card", ".careersafe-attachment");
    case "supporting-academics":
      return countCardPages(
        sheet,
        ".academic-document-card, .academic-checkoffs-card",
        ".academic-attachment",
      );
    case "table-of-contents":
    case "about-me":
    case "accomplishments":
    case "cew-standards":
    default:
      return estimateFlowPages(sheet);
  }
}

function updateContentsPageNumbers() {
  const pageBySection = new Map();
  let nextPage = 1;
  for (const sheet of document.querySelectorAll(".sheet")) {
    pageBySection.set(sheet.id, nextPage);
    const pageCount = sheetPageCount(sheet);
    nextPage += pageCount;

    const footer = sheet.querySelector("footer");
    if (footer) {
      let pageNumber = footer.querySelector(".sheet-page-number");
      if (!pageNumber) {
        pageNumber = document.createElement("span");
        pageNumber.className = "sheet-page-number";
        pageNumber.setAttribute("aria-label", "Page number");
        footer.append(pageNumber);
      }
      const lastPage = pageBySection.get(sheet.id) + pageCount - 1;
      pageNumber.textContent = pageCount > 1
        ? `Pages ${pageBySection.get(sheet.id)}–${lastPage}`
        : `Page ${pageBySection.get(sheet.id)}`;
    }
  }

  const hiringSheet = document.getElementById("hiring-documents");
  if (hiringSheet) {
    let recommendationPage = pageBySection.get("hiring-documents") || 1;
    for (const card of hiringSheet.querySelectorAll(".document-card")) {
      if (
        ["cover-letter", "resume", "standard-application", "recommendations"].includes(card.id)
      )
        pageBySection.set(card.id, recommendationPage);
      recommendationPage += attachmentPageCount(card.querySelector(".document-pages"));
    }
  }

  for (const item of document.querySelectorAll("#contents-list li")) {
    const target = item.dataset.target;
    const page = target ? pageBySection.get(target) : null;
    item.querySelector(".page-number").textContent = page ? String(page) : "—";
  }
}

document.getElementById("print-button").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = "Preparing…";
  try {
    const printed = await window.portfolioDesktop?.printPreview();
    if (printed === false) return;
    if (printed !== true) throw new Error("Printing is available in the desktop app.");
  } catch (error) {
    window.alert(error.message || "The portfolio could not be sent to print.");
  } finally {
    button.disabled = false;
    button.textContent = "Print Preview";
  }
});

window.addEventListener("resize", updateContentsPageNumbers);
