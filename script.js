const KEY = "ects-career-portfolio-v2";
const navItems = [
  ["about", "About Me"],
  ["checklist", "Portfolio Checklist"],
  ["documents", "Hiring Documents"],
  ["samples", "Work Samples"],
  ["credentials", "Industry Credentials"],
  ["accomplishments", "Accomplishments"],
  ["careersafe", "CareerSafe"],
  ["academics", "Supporting Academics"],
  ["cew", "CEW Standards"],
  ["customize", "Customize"],
];
const PROGRAMS = [
  [
    "amt",
    "Advanced Manufacturing Technology (AMT)",
    "https://www.ects.org/programs/advanced-manufacturing/",
  ],
  [
    "ads",
    "Art & Design for Business (ADS)",
    "https://www.ects.org/programs/art-and-design/",
  ],
  [
    "aur",
    "Automotive Body Repair (AUR)",
    "https://www.ects.org/programs/auto-body-repair/",
  ],
  [
    "aut",
    "Automotive Technology (AUT)",
    "https://www.ects.org/programs/automotive-technology/",
  ],
  [
    "cmn",
    "Computer Networking (CMN)",
    "https://www.ects.org/programs/computer-networking/",
  ],
  [
    "programming",
    "Computer Programming (CMP)",
    "https://www.ects.org/programs/computer-programming/",
  ],
  [
    "cnt",
    "Construction Trades (CNT)",
    "https://www.ects.org/programs/construction-trades/",
  ],
  ["cos", "Cosmetology (COS)", "https://www.ects.org/programs/cosmetology/"],
  [
    "cua",
    "Culinary, Baking & Pastry Arts (CUA)",
    "https://www.ects.org/programs/culinary-arts/",
  ],
  [
    "dde",
    "Drafting & Design Engineering (DDE)",
    "https://www.ects.org/programs/drafting-design/",
  ],
  [
    "ece",
    "Early Childhood Education (ECE)",
    "https://www.ects.org/programs/early-childhood-education/",
  ],
  [
    "eet",
    "Electrical Engineering Technology (EET)",
    "https://www.ects.org/programs/electrical-engineering/",
  ],
  [
    "eps",
    "Emergency & Protective Services (EPS)",
    "https://www.ects.org/programs/emergency-protective-services/",
  ],
  [
    "fmt",
    "Facility Maintenance Technology (FMT)",
    "https://www.ects.org/programs/facility-maintenance-technologies/",
  ],
  [
    "gra",
    "Graphic Media & Design (GRA)",
    "https://www.ects.org/programs/graphic-media/",
  ],
  [
    "hea",
    "Health Assistant (HEA)",
    "https://www.ects.org/programs/health-assistant/",
  ],
  [
    "heo",
    "Heavy Equipment Operation & Repair (HEO)",
    "https://www.ects.org/programs/heavy-equipment-operation-repair/",
  ],
  [
    "thm",
    "Hospitality Management & Tourism (THM)",
    "https://www.ects.org/programs/hospitality-management-tourism/",
  ],
  [
    "mtf",
    "Metal Fabrication Technology (MTF)",
    "https://www.ects.org/programs/metal-fabrication/",
  ],
  [
    "sts",
    "Sports Therapy & Exercise Science",
    "https://www.ects.org/programs/sports-therapy-exercise-science/",
  ],
];
const id = (prefix) =>
  `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random().toString(16).slice(2)}`;
const documentValue = (title = "") => ({
  id: id("document"),
  title,
  description: "",
  uploadedAt: null,
  file: null,
});
const achievement = () => ({
  id: id("achievement"),
  title: "",
  organization: "",
  date: "",
  description: "",
  file: null,
  publicationStatus: "draft",
});
const defaultState = () => ({
  id: id("portfolio"),
  student: {
    firstName: "",
    lastName: "",
    displayName: "",
    graduationYear: "2026",
    profileImage: null,
  },
  program: { id: "", name: "", school: "ECTS" },
  theme: "ects-professional",
  aboutMe: {
    careerGoal: "",
    biography: "",
    skills: [],
    interests: [],
    additionalInformation: "",
  },
  hiringDocuments: {
    coverLetter: documentValue("Cover Letter"),
    resume: documentValue("Resume"),
    standardApplication: documentValue("Standard Application"),
  },
  workSamples: [],
  credentials: [],
  accomplishments: {
    awards: [],
    accomplishments: [],
    extracurriculars: [],
    serviceExperiences: [],
  },
  recommendations: [],
  careerSafe: { entries: [] },
  supportingAcademics: {
    postSecondaryPlan: {
      careerGoal: "",
      educationGoal: "",
      schools: [],
      certifications: [],
      plans: "",
      additionalInformation: "",
    },
    growthReflection: null,
    reflections: [],
    potentialEmployers: [],
    postSecondaryOpportunities: [],
    homeSchoolReflection: null,
    instructionalAssistant: { name: "", date: "" },
    instructor: { name: "", date: "" },
  },
  cewStandards: {
    standard131: {
      id: "13.1",
      title: "Career Awareness & Exploration",
      description: "",
      evidence: [],
      explanation: "",
    },
    standard132: {
      id: "13.2",
      title: "Employability Skills",
      description: "",
      evidence: [],
      explanation: "",
    },
    standard133: {
      id: "13.3",
      title: "Growth & Advancement",
      description: "",
      evidence: [],
      explanation: "",
    },
    standard134: {
      id: "13.4",
      title: "Personal Interests & Career Planning",
      description: "",
      evidence: [],
      explanation: "",
    },
  },
  settings: {
    theme: "ects-professional",
    accentColor: "#c97245",
    font: "DM Sans",
    layout: "standard",
    showProfileImage: true,
    sectionOrder: [
      "aboutMe",
      "hiringDocuments",
      "workSamples",
      "credentials",
      "accomplishments",
      "supportingAcademics",
      "cewStandards",
    ],
    customSections: [],
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 2,
    lastExportedAt: null,
  },
  schemaVersion: 1,
});
let state = loadState();
let current = "about";
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const portfolioStore = () => window.portfolioDesktop;
function addCompatibilityAliases(portfolio) {
  const split = (value) =>
    Array.isArray(value)
      ? value
      : String(value || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
  const student = {};
  Object.defineProperties(student, {
    name: {
      get: () => portfolio.student.displayName,
      set: (value) => {
        portfolio.student.displayName = value || "";
        const parts = String(value || "")
          .trim()
          .split(/\s+/);
        portfolio.student.firstName = parts.shift() || "";
        portfolio.student.lastName = parts.join(" ");
      },
    },
    year: {
      get: () => portfolio.student.graduationYear,
      set: (value) => (portfolio.student.graduationYear = value),
    },
    goal: {
      get: () => portfolio.aboutMe.careerGoal,
      set: (value) => (portfolio.aboutMe.careerGoal = value),
    },
    bio: {
      get: () => portfolio.aboutMe.biography,
      set: (value) => (portfolio.aboutMe.biography = value),
    },
    skills: {
      get: () => skillNames(portfolio.aboutMe.skills).join(", "),
      set: (value) => setAboutSkillNames(portfolio.aboutMe, value),
    },
    interests: {
      get: () => portfolio.aboutMe.interests.join(", "),
      set: (value) => (portfolio.aboutMe.interests = split(value)),
    },
    image: {
      get: () => portfolio.student.profileImage,
      set: (value) => (portfolio.student.profileImage = value),
    },
  });
  portfolio.student = Object.assign(student, portfolio.student);
  const documents = {};
  for (const [key, documentKey] of [
    ["cover", "coverLetter"],
    ["resume", "resume"],
    ["standardApplication", "standardApplication"],
  ])
    Object.defineProperty(documents, key, {
      get: () => {
        const document = portfolio.hiringDocuments[documentKey];
        return document?.file?.fileName || "";
      },
      set: (value) => {
        const document = portfolio.hiringDocuments[documentKey];
        if (document?.file && typeof document.file === "object")
          document.file.fileName = value || "";
      },
    });
  const academics = {};
  for (const [key, target] of [
    ["postSecondary", "postSecondaryPlan.plans"],
    ["growth", "growthReflection.content"],
    ["reflection1", "reflections.0.content"],
    ["reflection2", "reflections.1.content"],
    ["employment", "hiringDocuments.standardApplication.description"],
    ["employers", "potentialEmployers.0.notes"],
    ["education", "postSecondaryOpportunities.0.notes"],
    ["home", "homeSchoolReflection.content"],
    ["iaName", "instructionalAssistant.name"],
    ["iaDate", "instructionalAssistant.date"],
    ["instructorName", "instructor.name"],
    ["instructorDate", "instructor.date"],
  ])
    Object.defineProperty(academics, key, {
      get: () =>
        target
          .split(".")
          .reduce(
            (value, part) => value?.[part],
            portfolio.supportingAcademics,
          ) || "",
      set: (value) => {
        const parts = target.split(".");
        let object = portfolio.supportingAcademics;
        parts.slice(0, -1).forEach((part) => {
          if (!object[part])
            object[part] =
              part === "reflections" ||
              part === "potentialEmployers" ||
              part === "postSecondaryOpportunities"
                ? []
                : {};
          object = object[part];
        });
        const last = parts.at(-1);
        if (Array.isArray(object)) {
          const index = Number(last);
          object[index] = object[index] || {
            id: id("reflection"),
            title: "",
            type: "",
            date: "",
            content: "",
            relatedExperience: "",
          };
          object[index].content = value;
        } else {
          object[last] = object[last] || {};
          if (last === "content") object[last] = value;
          else object[last] = value;
        }
      },
    });
  Object.defineProperties(portfolio, {
    files: {
      value: Object.assign(documents, {
        credentials: portfolio.credentials,
        recommendations: portfolio.recommendations,
      }),
      enumerable: false,
    },
    samples: { value: portfolio.workSamples, enumerable: false },
    careersafe: {
      value: ["1", "2", "3", "4"].map((category) => {
          const findItem = () => portfolio.careerSafe.entries.find((entry) => String(entry.category) === category);
          const getItem = () => findItem() || (
            portfolio.careerSafe.entries.push({ id: id("career-safe"), category, selectedOption: "", certificate: null, completionDate: "", notes: "" }),
            portfolio.careerSafe.entries.at(-1)
          );
          return Object.defineProperties(
            {},
            {
              choice: {
                get: () => findItem()?.selectedOption || "",
                set: (value) => (getItem().selectedOption = value),
              },
              file: {
                get: () => findItem()?.certificate?.fileName || "",
                set: (value) => {
                  const item = getItem();
                  item.certificate = item.certificate || { fileName: "" };
                  item.certificate.fileName = value;
                },
              },
            },
          );
        }),
      enumerable: false,
    },
    academics: { value: academics, enumerable: false },
    cew: {
      value: Object.values(portfolio.cewStandards).map((item) =>
        Object.defineProperties(
          {},
          {
            selected: {
              get: () => item.evidence.map((x) => x.portfolioItemType),
              set: (value) =>
                (item.evidence = value.map((x) => ({
                  portfolioItemType: x,
                  portfolioItemId: null,
                  description: "",
                }))),
            },
            description: {
              get: () => item.explanation,
              set: (value) => (item.explanation = value),
            },
          },
        ),
      ),
      enumerable: false,
    },
    custom: {
      value: {
        get theme() {
          return portfolio.settings.theme;
        },
        set theme(value) {
          portfolio.settings.theme = value;
        },
        get accent() {
          return portfolio.settings.accentColor;
        },
        set accent(value) {
          portfolio.settings.accentColor = value;
        },
      },
      enumerable: false,
    },
  });
  Object.defineProperty(portfolio.accomplishments, "activities", {
    get: () => portfolio.accomplishments.extracurriculars,
    set: (value) => (portfolio.accomplishments.extracurriculars = value),
  });
  Object.defineProperty(portfolio.accomplishments, "service", {
    get: () => portfolio.accomplishments.serviceExperiences,
    set: (value) => (portfolio.accomplishments.serviceExperiences = value),
  });
  Object.defineProperty(portfolio.accomplishments, "recommendations", {
    get: () => portfolio.recommendations,
    set: (value) => (portfolio.recommendations = value),
  });
  return portfolio;
}
function migrateLegacy(saved) {
  if (!saved || saved.version) return saved;
  if (saved.student) {
    const portfolio = defaultState();
    portfolio.student.displayName = saved.student.name || "";
    portfolio.student.graduationYear = saved.student.year || "2026";
    portfolio.aboutMe.careerGoal = saved.student.goal || "";
    portfolio.aboutMe.biography = saved.student.bio || "";
    portfolio.aboutMe.skills = splitList(saved.student.skills);
    portfolio.aboutMe.interests = splitList(saved.student.interests);
    portfolio.workSamples = saved.samples || [];
    portfolio.credentials = (
      (saved.files && saved.files.credentials) ||
      []
    ).map((name) => ({
      id: id("credential"),
      name,
      organization: "",
      date: "",
      description: "",
      file: null,
    }));
    portfolio.accomplishments.awards = (
      (saved.accomplishments && saved.accomplishments.awards) ||
      []
    ).map((title) => ({ ...achievement(), title }));
    return portfolio;
  }
  return defaultState();
}
function splitList(value) {
  return Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}
function skillNames(skills) {
  return (Array.isArray(skills) ? skills : []).map((skill) =>
    typeof skill === "string" ? skill : skill?.name || "",
  ).filter(Boolean);
}
function setAboutSkillNames(aboutMe, value) {
  const existing = Array.isArray(aboutMe.skills) ? aboutMe.skills : [];
  const byName = new Map(
    existing
      .filter((skill) => skill && typeof skill === "object")
      .map((skill) => [String(skill.name || "").trim().toLocaleLowerCase(), skill]),
  );
  aboutMe.skills = splitList(value).map((name) => {
    const match = byName.get(name.toLocaleLowerCase());
    return match || { id: id("skill"), name };
  });
  linkWorkSampleSkills(aboutMe.skills, state?.workSamples || []);
}
function linkWorkSampleSkills(skills, samples) {
  const byName = new Map(
    skills.map((skill) => [String(skill.name || "").trim().toLocaleLowerCase(), skill.id]),
  );
  for (const sample of samples) {
    const current = Array.isArray(sample.skills) ? sample.skills : splitList(sample.skills);
    const linked = [];
    const unmatched = [...(Array.isArray(sample.unmatchedSkills) ? sample.unmatchedSkills : [])];
    for (const entry of current) {
      const name = typeof entry === "string" ? entry : entry?.name || "";
      const skillId = typeof entry === "string" && skills.some((skill) => skill.id === entry)
        ? entry
        : byName.get(String(name).trim().toLocaleLowerCase());
      if (skillId) {
        if (!linked.includes(skillId)) linked.push(skillId);
      } else if (name && !unmatched.includes(name)) unmatched.push(name);
    }
    for (let index = unmatched.length - 1; index >= 0; index--) {
      const linkedId = byName.get(String(unmatched[index]).trim().toLocaleLowerCase());
      if (linkedId) {
        if (!linked.includes(linkedId)) linked.push(linkedId);
        unmatched.splice(index, 1);
      }
    }
    sample.skills = linked;
    if (unmatched.length) sample.unmatchedSkills = unmatched;
    else delete sample.unmatchedSkills;
  }
}
function sampleSkillsText(sample) {
  const byId = new Map((state.aboutMe.skills || []).map((skill) => [skill.id, skill.name]));
  const linked = (sample.skills || []).map((skill) => byId.get(skill) || "").filter(Boolean);
  return [...linked, ...(sample.unmatchedSkills || [])].join(", ");
}
function updateSampleSkillText(sample, value) {
  sample.skills = [];
  sample.unmatchedSkills = [];
  const byName = new Map(
    (state.aboutMe.skills || []).map((skill) => [skill.name.trim().toLocaleLowerCase(), skill.id]),
  );
  for (const name of splitList(value)) {
    const skillId = byName.get(name.toLocaleLowerCase());
    if (skillId) sample.skills.push(skillId);
    else sample.unmatchedSkills.push(name);
  }
  if (!sample.unmatchedSkills.length) delete sample.unmatchedSkills;
}
function attachmentFromLegacy(record) {
  if (!record || typeof record !== "object") return null;
  const fileRef = record.fileRef || "";
  const fileName = record.fileName || "";
  const fileType = record.fileType || "";
  if (!fileRef && !fileName && !fileType) return null;
  return {
    ...(fileRef ? { fileRef } : {}),
    ...(fileName ? { fileName } : {}),
    ...(fileType ? { fileType } : {}),
    ...(record.uploadedAt ? { uploadedAt: record.uploadedAt } : {}),
  };
}
function mergeAchievementRecords(canonical, legacy) {
  const records = Array.isArray(canonical) ? canonical : [];
  const legacyRecords = Array.isArray(legacy)
    ? legacy
    : legacy && typeof legacy === "object"
      ? Object.keys(legacy)
          .filter((key) => /^\d+$/.test(key))
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => legacy[key])
      : [];
  const merged = records.map((record) => ({ ...(record || {}) }));
  const used = new Set();
  for (const item of legacyRecords) {
    if (!item || typeof item !== "object") continue;
    let matchIndex = merged.findIndex((candidate, index) =>
      !used.has(index) && item.id && candidate.id === item.id,
    );
    if (matchIndex < 0 && legacyRecords.length === 1 && merged.length === 1)
      matchIndex = 0;
    if (matchIndex < 0) {
      const title = String(item.title || "").trim().toLocaleLowerCase();
      if (title)
        matchIndex = merged.findIndex((candidate, index) =>
          !used.has(index) && String(candidate.title || "").trim().toLocaleLowerCase() === title,
        );
    }
    if (matchIndex >= 0) {
      const candidate = merged[matchIndex];
      let conflict = false;
      for (const key of ["title", "organization", "date", "description"]) {
        if (candidate[key] && item[key] && candidate[key] !== item[key]) conflict = true;
      }
      if (!conflict) {
        for (const key of ["id", "title", "organization", "date", "description", "file"])
          if ((candidate[key] === undefined || candidate[key] === "" || candidate[key] === null) && item[key] !== undefined)
            candidate[key] = item[key];
        used.add(matchIndex);
        continue;
      }
    }
    merged.push({ ...item, id: item.id || id("achievement") });
  }
  return merged.map((record) => {
    const normalized = {
      ...record,
      id: record.id || id("achievement"),
      title: record.title || "",
      organization: record.organization || "",
      date: record.date || "",
      description: record.description || "",
      file: record.file || attachmentFromLegacy(record),
    };
    for (const key of ["fileName", "fileType", "fileData", "fileRef"]) delete normalized[key];
    if (!normalized.file) normalized.file = null;
    return normalized;
  });
}
function normalizeDate(value) {
  if (typeof value !== "string" || !value.trim()) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{1,2}\/\d{2}$/.test(value)) return value; // Ambiguous month/year or month/day; preserve it.
  const match = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (!match) return value;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = match[3].length === 2 ? (rawYear <= 68 ? 2000 + rawYear : 1900 + rawYear) : rawYear;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return value;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function normalizePortfolioDates(value) {
  if (Array.isArray(value)) {
    value.forEach(normalizePortfolioDates);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if ((key === "date" || key === "completionDate") && typeof child === "string")
      value[key] = normalizeDate(child);
    else normalizePortfolioDates(child);
  }
}
function loadState() {
  return addCompatibilityAliases(ensurePortableShape(defaultState()));
}
function save(silent = false) {
  try {
    state.metadata.updatedAt = new Date().toISOString();
    const store = portfolioStore();
    if (store) {
      store
        .saveCurrent(state)
        .catch(() => toast("Unable to save the local portfolio file."));
    }
    updateSaveStatus();
    if (!silent) toast("Portfolio saved on this device.");
  } catch {
    toast("Unable to save the portfolio.");
  }
}
function updateSaveStatus() {
  const el = $("#save-status");
  if (el)
    el.textContent = state.metadata.updatedAt
      ? "Saved " +
        new Date(state.metadata.updatedAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "Not saved";
}
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}
function show(id) {
  ["landing", "setup", "app"].forEach((x) =>
    $("#" + x).classList.toggle("hidden", x !== id),
  );
}
function start() {
  show("setup");
  $("#setup-name").focus();
}
function populatePrograms() {
  const select = $("#setup-program");
  if (!select) return;
  select.innerHTML = PROGRAMS.map(
    ([id, name]) => `<option value="${id}">${name}</option>`,
  ).join("");
  select.value = state.program.id || "programming";
}
function syncProgram() {
  const selected =
    PROGRAMS.find(([id]) => id === state.program.id) ||
    PROGRAMS.find(([id]) => id === "programming");
  const name =
    state.program.id === selected[0] && state.program.name
      ? state.program.name
      : selected[1];
  state.program = {
    ...state.program,
    id: selected[0],
    name,
    school: state.program.school || "ECTS",
    website: state.program.website || selected[2],
  };
  const header = $("#header-program");
  if (header) header.textContent = state.program.name;
}
function startApp() {
  syncProgram();
  show("app");
  $("#header-student-name").textContent = state.student.name || "Student";
  $("#header-program").textContent = state.program.name;
  renderNav();
  render();
  updateProgress();
}
function renderNav() {
  const nav = $("#section-nav");
  nav.innerHTML = navItems
    .map(
      ([id, label], i) =>
        `<button type="button" class="nav-item ${current === id ? "active" : ""}" ${current === id ? 'aria-current="step"' : ""} data-section="${id}"><span class="nav-number">${String(i + 1).padStart(2, "0")}</span><span>${label}</span>${isSectionDone(id) ? '<span class="nav-check" aria-hidden="true">✓</span>' : ""}</button>`,
    )
    .join("");
  nav.querySelectorAll("[data-section]").forEach(
    (b) =>
      (b.onclick = () => {
        current = b.dataset.section;
        renderNav();
        render();
        closeMenu();
      }),
  );
}
function isSectionDone(id) {
  if (id === "about")
    return !!(state.student.name && state.student.goal && state.student.bio);
  if (id === "checklist") return progress() >= 100;
  if (id === "customize") return true;
  if (id === "samples") return state.samples.length >= 5;
  if (id === "documents")
    return !!(
      state.files.cover &&
      state.files.resume &&
      state.files.recommendations.filter(Boolean).length >= 2
    );
  if (id === "credentials") return state.credentials.length > 0;
  if (id === "accomplishments")
    return state.accomplishments.accomplishments.length > 0;
  if (id === "careersafe")
    return state.careersafe.every((x) => x.choice && x.file);
  if (id === "academics")
    return !!(
      state.academics.postSecondary &&
      state.academics.growth &&
      state.academics.reflection1 &&
      state.academics.reflection2
    );
  if (id === "cew")
    return state.cew.every((x) => x.selected.length && x.description);
  return false;
}
function progress() {
  let done = 0;
  const checks = [
    !!(state.student.name && state.student.goal && state.student.bio),
    !!(
      state.files.cover &&
      state.files.resume &&
      state.files.recommendations.filter(Boolean).length >= 2
    ),
    state.samples.length >= 5,
    state.credentials.length > 0,
    state.accomplishments.accomplishments.length > 0,
    state.careersafe.every((x) => x.choice && x.file),
    !!(
      state.academics.postSecondary &&
      state.academics.growth &&
      state.academics.reflection1 &&
      state.academics.reflection2
    ),
    state.cew.every((x) => x.selected.length && x.description),
  ];
  done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
function updateProgress() {
  const p = progress();
  $("#progress-label").textContent = p + "%";
  $("#progress-bar").style.width = p + "%";
  $("#progress-summary").textContent =
    p === 100
      ? "Portfolio ready to review"
      : `${8 - Math.round((p / 100) * 8)} required areas still need attention`;
}
function heading(kicker, title, desc, actions = "") {
  return `<div class="editor-heading"><div><p class="section-kicker">${kicker}</p><h1>${title}</h1><p>${desc}</p></div><div class="editor-actions">${actions}</div></div>`;
}
function render() {
  const views = {
    about: aboutView,
    checklist: checklistView,
    documents: documentsView,
    samples: samplesView,
    credentials: credentialsView,
    accomplishments: accomplishmentsView,
    careersafe: careerSafeView,
    academics: academicsView,
    cew: cewView,
    customize: customizeView,
  };
  document.documentElement.style.setProperty(
    "--accent",
    state.custom.accent || "#c97245",
  );
  $("#editor").innerHTML = views[current]();
  bindEditor();
  updateProgress();
}
function aboutView() {
  const s = state.student;
  return (
    heading(
      "01 · Your story",
      "About me",
      "Introduce the person behind the work. This page becomes the opening of your portfolio.",
    ) +
    `<section class="section-card"><div class="field-grid"><label class="field-label">First name<input data-bind="student.firstName" value="${esc(s.firstName)}" placeholder="First name"></label><label class="field-label">Last name<input data-bind="student.lastName" value="${esc(s.lastName)}" placeholder="Last name"></label><label class="field-label">Program<input data-bind="program.name" value="${esc(state.program.customNameEntered ? state.program.name || "" : "")}" placeholder="Type your program"></label><label class="field-label">Graduation year<select data-bind="student.graduationYear"><option ${s.graduationYear === "2026" ? "selected" : ""}>2026</option><option ${s.graduationYear === "2027" ? "selected" : ""}>2027</option><option ${s.graduationYear === "2028" ? "selected" : ""}>2028</option><option ${s.graduationYear === "2029" ? "selected" : ""}>2029</option></select></label><label class="field-label">Career goal<input data-bind="aboutMe.careerGoal" value="${esc(state.aboutMe.careerGoal)}" placeholder="e.g. Software developer"></label><label class="field-label field-full">Short biography<textarea data-bind="aboutMe.biography" placeholder="Write a short introduction about yourself, your interests, and what you hope to do after graduation.">${esc(state.aboutMe.biography)}</textarea></label><label class="field-label">Skills<textarea data-bind="aboutMe.skills" placeholder="Java, problem solving, communication...">${esc(skillNames(state.aboutMe.skills).join(", "))}</textarea></label><label class="field-label">Interests<textarea data-bind="aboutMe.interests" placeholder="What do you enjoy learning or doing?">${esc(state.aboutMe.interests.join(", "))}</textarea></label><label class="field-label field-full">Additional information<textarea data-bind="aboutMe.additionalInformation" placeholder="Anything else you want a reviewer to know.">${esc(state.aboutMe.additionalInformation)}</textarea></label></div></section><section class="section-card"><h2>Profile image</h2><p>Optional. Use a clear, professional image. It stays on this device.</p>${fileUpload("profile", "Choose image", "student.image")}</section>`
  );
}
function portfolioChecklistItems() {
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const hasAttachment = (value) => {
    if (typeof value === "string") return hasText(value);
    if (!value || typeof value !== "object") return false;
    if ("file" in value) return hasAttachment(value.file);
    return Boolean(value.fileName || value.name || value.fileRef || value.fileData);
  };
  const studentName = [state.student.firstName, state.student.lastName]
    .filter(hasText)
    .join(" ") || state.student.displayName;
  const aboutComplete = Boolean(
    hasText(studentName) &&
      hasText(state.aboutMe.careerGoal) &&
      hasText(state.aboutMe.biography),
  );
  const academicDocuments = state.supportingAcademics.documents || {};
  const requiredAcademicDocuments = [
    ["postSecondary", "Post-secondary plan"],
    ["growth", "Co-op / SkillsUSA / ECTS growth reflection"],
    ["reflection1", "ATD / field trip reflection 1"],
    ["reflection2", "ATD / field trip reflection 2"],
  ];
  const otherAcademicDocuments = [
    ["employment", "Standard application for employment", true],
    ["employers", "Potential employers", true],
    ["education", "Post-secondary education opportunities", true],
    ["home", "Home school reflection", true],
  ];
  const samples = state.workSamples || [];
  const sampleSlots = Math.max(5, samples.length);
  const credentials = state.credentials || [];
  const recommendations = state.recommendations || [];
  const safeEntries = state.careerSafe.entries || [];
  const standards = Object.values(state.cewStandards || {});
  const accomplishments = [
    ...(state.accomplishments.awards || []),
    ...(state.accomplishments.accomplishments || []),
    ...(state.accomplishments.extracurriculars || []),
    ...(state.accomplishments.serviceExperiences || []),
  ];
  const items = [
    { id: "about", label: "About Me", done: aboutComplete, group: "about", target: "about-me" },
    { id: "contents", label: "Table of Contents", done: true, group: "contents", target: "table-of-contents" },
    { id: "cover-letter", label: "Cover Letter", done: hasAttachment(state.hiringDocuments.coverLetter), group: "documents", target: "cover-letter" },
    { id: "resume", label: "Resume", done: hasAttachment(state.hiringDocuments.resume), group: "documents", target: "resume" },
    ...Array.from({ length: sampleSlots }, (_, index) => {
      const sample = samples[index] || {};
      return {
        id: `work-sample-${index + 1}`,
        label: `Work Sample ${index + 1}`,
        done: hasText(sample.title) && (hasText(sample.description) || hasAttachment(sample.file)),
        optional: index >= 5,
        group: "samples",
        target: "work-samples",
      };
    }),
    ...(credentials.length
      ? credentials.map((credential, index) => ({
          id: `credential-${index + 1}`,
          label: `Industry Credential ${index + 1}`,
          done: hasText(credential.name) && (hasText(credential.description) || hasAttachment(credential.file)),
          optional: index > 0,
          group: "credentials",
          target: "industry-credentials",
        }))
      : [{ id: "credential-1", label: "Industry Credential", done: false, group: "credentials", target: "industry-credentials" }]),
    { id: "accomplishments", label: "Accomplishments", done: accomplishments.some((entry) => hasText(typeof entry === "string" ? entry : entry?.title)), group: "accomplishments", target: "accomplishments" },
    ...Array.from({ length: Math.max(2, recommendations.length) }, (_, index) => ({
      id: `recommendation-${index + 1}`,
      label: `Recommendation Letter ${index + 1}`,
      done: hasAttachment(recommendations[index]?.file || recommendations[index]),
      optional: index >= 2,
      group: "recommendations",
      target: "recommendations",
    })),
    ...Array.from({ length: Math.max(4, safeEntries.length) }, (_, index) => ({
      id: `careersafe-${index + 1}`,
      label: `CareerSafe ${index + 1}`,
      done: Boolean(safeEntries[index]?.selectedOption && hasAttachment(safeEntries[index]?.certificate)),
      optional: index >= 4,
      group: "careersafe",
      target: "careersafe",
    })),
    ...requiredAcademicDocuments.map(([key, label]) => ({
      id: `academic-${key}`,
      label,
      done: hasAttachment(academicDocuments[key]),
      group: "academics",
      target: "supporting-academics",
    })),
    ...otherAcademicDocuments.map(([key, label, optional = false]) => ({
      id: `academic-${key}`,
      label,
      done: hasAttachment(academicDocuments[key]),
      optional,
      group: "academics-extra",
      target: "supporting-academics",
    })),
    ...standards.map((standard) => ({
      id: `cew-${standard.id}`,
      label: `CEW ${standard.id} ${standard.title}`,
      done: Boolean(standard.evidence?.length && hasText(standard.explanation)),
      group: "cew",
      target: "cew-standards",
    })),
  ];
  return items;
}
function portfolioContents() {
  return [
    ["About Me", "about-me"],
    ["Hiring Documents", "hiring-documents"],
    ["Work Samples", "work-samples"],
    ["Industry Credentials", "industry-credentials"],
    ["Accomplishments", "accomplishments"],
    ["Recommendation Letters", "recommendations"],
    ["CareerSafe Certifications", "careersafe"],
    ["Supporting Academics", "supporting-academics"],
    ["CEW Standards", "cew-standards"],
    ...(state.settings?.customSections || [])
      .filter((section) => hasPortfolioText(section.title))
      .map((section, index) => [section.title, `custom-section-${index + 1}`]),
  ].map(([label, target]) => ({ label, target }));
}
function hasPortfolioText(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function checklistView() {
  const items = portfolioChecklistItems();
  return (
    heading(
      "02 · Keep track",
      "Portfolio checklist",
      "A clear view of what is complete, what still needs attention, and what is optional.",
    ) +
    `<section class="section-card"><div class="requirement-list">${items.map((item) => `<div class="requirement-row"><input type="checkbox" disabled ${item.done ? "checked" : ""} aria-label="${item.done ? "Complete" : "Incomplete"}: ${esc(item.label)}"><span>${esc(item.label)}${item.optional ? " <small>(optional)</small>" : ""}</span><span class="requirement-status ${item.done ? "done" : ""}">${item.done ? "Complete" : item.optional ? "Optional" : "Missing"}</span></div>`).join("")}</div></section>${progress() < 100 ? '<div class="warning"><strong>Your portfolio is still in progress.</strong><br>You can export at any time, but completing the missing items will make your portfolio stronger.</div>' : ""}`
  );
}
function getPath(path) {
  return path
    .split(".")
    .reduce((value, key) => (value == null ? undefined : value[key]), state);
}
function fileUpload(key, label, bind) {
  const defaultBindings = {
    cover: "hiringDocuments.coverLetter.file",
    resume: "hiringDocuments.resume.file",
  };
  const path = bind || defaultBindings[key] || key;
  const isProfileImage = path === "student.image";
  const accept = isProfileImage
    ? ".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
    : ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif,image/webp";
  let value = bind
    ? getPath(bind)
    : defaultBindings[key]
      ? getPath(defaultBindings[key])
      : state.files[key] || state.student.image;
  if (value && typeof value === "object")
    value = value.fileName || value.name || "";
  return `<div class="upload-box"><div><strong>${value ? "File attached" : "No file attached"}</strong><small>${isProfileImage ? "PNG, JPG, JPEG, GIF, or WEBP image" : "PDF, DOC, DOCX, or image"} · stored locally</small></div><label class="upload-label">${label}<input type="file" data-file="${path}" accept="${accept}"></label></div>${value ? `<div class="file-item"><span>${esc(value)}</span><button type="button" data-remove-file="${path}">Remove</button></div>` : ""}`;
}
function documentsView() {
  return (
    heading(
      "03 · Hiring documents",
      "Hiring documents",
      "Collect the documents that help an employer understand your readiness.",
    ) +
    `<section class="section-card"><h2>Cover letter</h2><p>A focused letter that connects your skills to an opportunity.</p>${fileUpload("cover", "Upload cover letter")}${publicationControl(state.hiringDocuments.coverLetter, "hiringDocuments.coverLetter", "document")}</section><section class="section-card"><h2>Resume</h2><p>Keep your resume current and easy to scan.</p>${fileUpload("resume", "Upload resume")}${publicationControl(state.hiringDocuments.resume, "hiringDocuments.resume", "document")}</section><section class="section-card"><h2>Recommendation letters</h2><p>At least 2 letters are required. Add more when you have them.</p>${recommendations()}</section>`
  );
}
function publicationControl(record, key, kind) {
  const issues = window.PortfolioQuality?.issues(kind, record) || [];
  const status = record.publicationStatus === "published" ? "published" : "draft";
  return `<div class="publication-control"><label class="field-label">Visibility<select data-publication="${key}" aria-label="Publication status"><option value="draft" ${status === "draft" ? "selected" : ""}>Draft</option><option value="published" ${status === "published" ? "selected" : ""}>Published</option></select></label><p class="microcopy">Drafts stay private in portfolio previews. Review each quality note before publishing.</p>${issues.length ? `<ul class="quality-issues">${issues.map((issue) => `<li>${esc(issue)}</li>`).join("")}</ul>` : '<p class="quality-ready">Ready for review.</p>'}</div>`;
}
function recommendations() {
  const r = state.files.recommendations || [];
  return `<div>${[0, 1, ...Array.from({ length: Math.max(0, r.length - 2) }, (_, i) => i + 2)].map((i) => {
    const record = r[i] || (r[i] = { id: id("recommendation"), authorName: "", relationship: "", date: "", file: null });
    return `<div class="repeater"><div class="repeater-header"><strong>Recommendation ${i + 1}</strong>${i > 1 ? `<button class="remove-button" data-remove-rec="${i}">Remove</button>` : ""}</div><div class="field-grid"><label class="field-label">Author name<input data-recommendation="${i}.authorName" value="${esc(record.authorName || "")}" placeholder=""></label><label class="field-label">Relationship<input data-recommendation="${i}.relationship" value="${esc(record.relationship || "")}" placeholder=""></label><label class="field-label">Date<input type="date" data-recommendation="${i}.date" value="${esc(normalizeDate(record.date || ""))}"></label></div>${fileUpload("recommendations", "Upload letter", "files.recommendations." + i + ".file")}${publicationControl(record, `recommendations.${i}`, "recommendation")}</div>`;
  }).join("")}</div><button class="add-button" data-add="recommendation">+ Add recommendation</button><p class="microcopy">${r.filter((record) => record?.file?.fileRef || record?.file?.fileName).length} of 2 required recommendations uploaded.</p>`;
}
function samplesView() {
  return (
    heading(
      "04 · Show your work",
      "Work samples",
      `Add at least 5 projects. You can include more to show range and growth.`,
    ) +
    `${state.samples.length < 5 ? '<div class="warning"><strong>Add ' + (5 - state.samples.length) + " more work sample" + (5 - state.samples.length === 1 ? "" : "s") + " to meet the requirement.</strong></div>" : ""}<section class="section-card">${state.samples.map((x, i) => `<div class="repeater"><div class="repeater-header"><strong>Work sample ${i + 1}</strong><button class="remove-button" data-remove-sample="${i}">Remove</button></div><div class="field-grid"><label class="field-label">Title<input data-sample="${i}.title" value="${esc(x.title)}" placeholder="e.g. Java Calculator"></label><label class="field-label">Date<input data-sample="${i}.date" value="${esc(x.date)}" placeholder="Month, year"></label><label class="field-label">Class / project<input data-sample="${i}.classOrProject" value="${esc(x.classOrProject)}" placeholder="e.g. Programming II"></label><label class="field-label">Skills demonstrated<input data-sample="${i}.skills" value="${esc(sampleSkillsText(x))}" placeholder="Java, problem solving"></label><label class="field-label field-full">Description<textarea data-sample="${i}.description" placeholder="What did you build, and what did you learn?">${esc(x.description)}</textarea></label><label class="field-label field-full">Reflection<textarea data-sample="${i}.reflection" placeholder="What did this project teach you?">${esc(x.reflection)}</textarea></label><label class="field-label field-full">Optional link<input data-sample="${i}.link" value="${esc(x.link)}" placeholder="https://..."></label></div>${fileUpload("sample" + i, "Attach work sample", "samples." + i + ".file")}${publicationControl(x, `samples.${i}`, "workSample")}</div>`).join("")}<button class="add-button" data-add="sample">+ Add work sample</button></section>`
  );
}
function credentialsView() {
  return (
    heading(
      "05 · Keep learning",
      "Industry credentials",
      "Add recognized certifications, badges, and training that support your career goal.",
    ) +
    `<section class="section-card"><h2>Credentials</h2><p>Upload certificates or add a short description of each credential.</p>${state.credentials.map((x, i) => `<div class="repeater"><div class="repeater-header"><strong>Credential ${i + 1}</strong><button class="remove-button" data-remove-credential="${i}">Remove</button></div><div class="field-grid"><label class="field-label">Name<input data-credential="${i}" value="${esc(x.name)}" placeholder="e.g. Java certification"></label><label class="field-label">Organization<input data-achievement="credentials.${i}.organization" value="${esc(x.organization)}" placeholder="Issuing organization"></label><label class="field-label">Date<input data-achievement="credentials.${i}.date" value="${esc(x.date)}" placeholder="Month, year"></label><label class="field-label">Description<textarea data-achievement="credentials.${i}.description" placeholder="What does this credential represent?">${esc(x.description)}</textarea></label></div>${fileUpload("", x.file?.fileName ? "Replace certificate" : "Choose file", "credentials." + i + ".file")}${publicationControl(x, `credentials.${i}`, "credential")}</div>`).join("")}<button class="add-button" data-add="credential">+ Add credential</button></section>`
  );
}
function accomplishmentsView() {
  const groups = [
    ["awards", "Awards", "Recognition you have received."],
    ["accomplishments", "Accomplishments", "Milestones you are proud of."],
    [
      "activities",
      "Extracurricular activities",
      "Clubs, teams, and leadership.",
    ],
    [
      "service",
      "Service experiences",
      "Ways you have contributed to your community.",
    ],
  ];
  return (
    heading(
      "06 · Your momentum",
      "Accomplishments",
      "Make the progress behind your portfolio visible.",
    ) +
    groups
      .map(
        ([key, title, desc]) =>
          `<section class="section-card"><h2>${title}</h2><p>${desc}</p>${state.accomplishments[key].map((x, i) => `<div class="repeater"><div class="repeater-header"><strong>Entry ${i + 1}</strong><button class="remove-button" data-remove-entry="${key}.${i}">Remove</button></div><div class="field-grid"><label class="field-label">Title<input data-entry="${key}.${i}" value="${esc(x.title || x)}" placeholder="e.g. Honor Roll"></label><label class="field-label">Organization<input data-achievement="${key}.${i}.organization" value="${esc(x.organization)}" placeholder="Organization or class"></label><label class="field-label">Date<input data-achievement="${key}.${i}.date" value="${esc(x.date)}" placeholder="Month, year"></label><label class="field-label">Description<textarea data-achievement="${key}.${i}.description" placeholder="What did this experience mean to you?">${esc(x.description)}</textarea></label></div>${publicationControl(x, `accomplishments.${key}.${i}`, "achievement")}</div>`).join("")}<button class="add-button" data-add="${key}">+ Add ${title.toLowerCase().replace("experiences", "experience").replace("activities", "activity")}</button></section>`,
      )
      .join("")
  );
}
function careerSafeView() {
  const choices = [
    ["Teamwork", "Interview Skills Certification", "Time Management"],
    ["Cybersecurity", "Materials Management", "Critical Thinking"],
    [
      "Human Resource Management",
      "Communication Skills",
      "Written Communication",
    ],
    ["Workplace Financial Management", "Personal Financial Management"],
  ];
  return (
    heading(
      "07 · CareerSafe",
      "CareerSafe certifications",
      "Choose the certification that best represents each CareerSafe area and attach the evidence.",
    ) +
    choices
      .map(
        (arr, i) =>
          `<section class="section-card"><div class="repeater-header"><div><p class="section-kicker">CareerSafe ${i + 1}</p><h2>Choose a certification</h2></div><span class="requirement-status ${state.careersafe[i].choice && state.careersafe[i].file ? "done" : ""}">${state.careersafe[i].choice && state.careersafe[i].file ? "Complete" : "Required"}</span></div><div class="check-grid">${arr.map((c) => `<label><input type="radio" name="safe${i}" data-safe="${i}" value="${c}" ${state.careersafe[i].choice === c ? "checked" : ""}>${c}</label>`).join("")}</div>${fileUpload("safe" + i, "Upload certificate", "careersafe." + i)}</section>`,
      )
      .join("")
  );
}
function academicsView() {
  const a = state.academics;
  const areas = [
    [
      "postSecondary",
      "Post-secondary plan",
      "What are your next steps after graduation?",
    ],
    [
      "growth",
      "Co-op / SkillsUSA / ECTS growth reflection",
      "What did this experience teach you?",
    ],
    [
      "reflection1",
      "ATD / field trip reflection 1",
      "Describe a moment that expanded your perspective.",
    ],
    ["reflection2", "ATD / field trip reflection 2", "What did you take away?"],
    [
      "employment",
      "Standard application for employment",
      "Upload from Hiring Documents or add notes here.",
    ],
    [
      "employers",
      "Potential employers",
      "List employers you would like to learn more about.",
    ],
    [
      "education",
      "Post-secondary education opportunities",
      "List programs, schools, or pathways.",
    ],
    [
      "home",
      "Home school reflection (optional)",
      "Reflect on experiences at your home school.",
    ],
  ];
  return (
    heading(
      "08 · Look ahead",
      "Supporting academics",
      "Connect your technical work to your next steps and experiences beyond the lab.",
    ) +
    areas
      .map(
        ([key, title, placeholder]) =>
          `<section class="section-card"><h2>${title}${key === "home" ? " <small>(Optional)</small>" : ""}</h2><textarea data-bind="academics.${key}" placeholder="${placeholder}">${esc(a[key])}</textarea></section>`,
      )
      .join("") +
    `<section class="section-card"><h2>Checkoffs</h2><p>Editable sign-off fields for your portfolio review.</p><div class="field-grid"><label class="field-label">Instructional assistant name<input data-bind="academics.iaName" value="${esc(a.iaName)}"></label><label class="field-label">Date<input data-bind="academics.iaDate" value="${esc(a.iaDate)}"></label><label class="field-label">Instructor name<input data-bind="academics.instructorName" value="${esc(a.instructorName)}"></label><label class="field-label">Date<input data-bind="academics.instructorDate" value="${esc(a.instructorDate)}"></label></div></section>`
  );
}
function cewView() {
  const standards = [
    "13.1 Career Awareness & Exploration",
    "13.2 Employability Skills",
    "13.3 Growth & Advancement",
    "13.4 Personal Interests & Career Planning",
  ];
  const evidence = [
    "Post-secondary plan",
    "Career goal",
    "Potential employers",
    "Work samples",
    "Career reflections",
  ];
  return (
    heading(
      "09 · Future ready",
      "CEW standards",
      "Choose evidence and explain how your portfolio demonstrates each standard.",
    ) +
    standards
      .map(
        (s, i) =>
          `<section class="section-card cew-card"><h2>${s}</h2><div class="check-grid">${evidence.map((e) => `<label><input type="checkbox" data-cew="${i}" value="${e}" ${state.cew[i].selected.includes(e) ? "checked" : ""}>${e}</label>`).join("")}</div><label class="field-label">Evidence explanation<textarea data-cew-desc="${i}" placeholder="Explain how your portfolio demonstrates this standard.">${esc(state.cew[i].description)}</textarea></label></section>`,
      )
      .join("")
  );
}
function customizeView() {
  return (
    heading(
      "10 · Make it yours",
      "Customize",
      "Choose a visual direction and keep the structure that makes your portfolio complete.",
    ) +
    `<section class="section-card"><h2>Portfolio theme</h2><p>The default ECTS Professional theme is designed for clear, confident presentation.</p><div class="theme-grid">${["ECTS Professional", "Modern", "Classic", "Minimal"].map((t) => `<button class="theme-choice ${state.custom.theme === t ? "selected" : ""}" data-theme="${t}"><div class="theme-swatch"></div><strong>${t}</strong><small>${t === "ECTS Professional" ? "Institutional and warm" : "Focused and professional"}</small></button>`).join("")}</div></section><section class="section-card"><h2>Accent color</h2><label class="field-label">Choose a color<input type="color" data-bind="custom.accent" value="${state.custom.accent}"></label></section><section class="section-card"><h2>Custom sections</h2><p>Add optional pages without changing required ECTS sections.</p>${state.settings.customSections.map((section, index) => `<div class="repeater"><div class="repeater-header"><strong>Custom section ${index + 1}</strong><button class="remove-button" data-remove-custom="${index}">Remove</button></div><label class="field-label">Heading<input data-custom="${index}.title" value="${esc(section.title)}" placeholder="e.g. Projects I’m proud of"></label><label class="field-label">Content<textarea data-custom="${index}.content" placeholder="Add anything you want to include.">${esc(section.content)}</textarea></label></div>`).join("")}<button class="add-button" data-add="customSection">+ Add custom section</button></section>`
  );
}
function setPath(path, value) {
  const parts = path.split(".");
  let obj = state;
  parts.slice(0, -1).forEach((p) => {
    if (!obj[p]) obj[p] = {};
    obj = obj[p];
  });
  const key = parts.at(-1);
  if (path === "aboutMe.skills") setAboutSkillNames(state.aboutMe, value);
  else obj[key] = key === "interests" ? splitList(value) : value;
}
function bindEditor() {
  document.querySelectorAll("[data-publication]").forEach((el) => {
    el.onchange = () => {
      const [collection, indexText] = el.dataset.publication.split(".");
      const index = Number(indexText);
      const record = collection === "samples" ? state.workSamples[index]
        : collection === "credentials" ? state.credentials[index]
          : collection === "recommendations" ? state.recommendations[index]
            : collection === "careerSafe" ? state.careerSafe.entries[index]
              : collection === "accomplishments" ? state.accomplishments[el.dataset.publication.split(".")[1]][Number(el.dataset.publication.split(".")[2])]
                : collection === "supportingAcademics" ? state.supportingAcademics.documents[el.dataset.publication.split(".")[2]]
                : collection === "hiringDocuments" ? state.hiringDocuments[el.dataset.publication.split(".")[1]]
                  : null;
      if (record) record.publicationStatus = el.value;
      save(true);
      render();
    };
  });
  document.querySelectorAll("[data-bind]").forEach(
    (el) =>
      (el.oninput = () => {
        setPath(el.dataset.bind, el.value);
        if (
          el.dataset.bind === "student.firstName" ||
          el.dataset.bind === "student.lastName"
        ) {
          state.student.displayName = [
            state.student.firstName,
            state.student.lastName,
          ]
            .filter(Boolean)
            .join(" ");
          $("#header-student-name").textContent =
            state.student.displayName || "Student";
        }
        save(true);
        updateProgress();
      }),
  );
  document.querySelectorAll("[data-sample]").forEach(
    (el) =>
      (el.oninput = () => {
        const [i, k] = el.dataset.sample.split(".");
        if (k === "skills") updateSampleSkillText(state.samples[i], el.value);
        else state.samples[i][k] = el.value;
        save(true);
        updateProgress();
      }),
  );
  document.querySelectorAll("[data-academic-description]").forEach(
    (el) =>
      (el.oninput = () => {
        const key = el.dataset.academicDescription;
        state.supportingAcademics.documents[key].description = el.value;
        save(true);
      }),
  );
  document.querySelectorAll("[data-entry]").forEach(
    (el) =>
      (el.oninput = () => {
        const [k, i] = el.dataset.entry.split(".");
        state.accomplishments[k][i].title = el.value;
        save(true);
      }),
  );
  document.querySelectorAll("[data-achievement]").forEach(
    (el) =>
      (el.oninput = () => {
        setPath(el.dataset.achievement, el.value);
        save(true);
      }),
  );
  document.querySelectorAll("[data-custom]").forEach(
    (el) =>
      (el.oninput = () => {
        const [i, key] = el.dataset.custom.split(".");
        state.settings.customSections[i][key] = el.value;
        save(true);
      }),
  );
  document.querySelectorAll("[data-credential]").forEach(
    (el) =>
      (el.oninput = () => {
        state.credentials[el.dataset.credential].name = el.value;
        save(true);
      }),
  );
  document.querySelectorAll("[data-recommendation]").forEach((el) => {
    el.oninput = () => {
      const [index, key] = el.dataset.recommendation.split(".");
      if (state.recommendations[index]) {
        state.recommendations[index][key] = key === "date" ? normalizeDate(el.value) : el.value;
        save(true);
      }
    };
  });
  document.querySelectorAll("[data-safe]").forEach(
    (el) =>
      (el.onchange = () => {
        state.careersafe[el.dataset.safe].choice = el.value;
        save(true);
        render();
      }),
  );
  document.querySelectorAll("[data-cew]").forEach(
    (el) =>
      (el.onchange = () => {
        const i = el.dataset.cew;
        state.cew[i].selected = [
          ...document.querySelectorAll(`[data-cew="${i}"]:checked`),
        ].map((x) => x.value);
        save(true);
        updateProgress();
      }),
  );
  document.querySelectorAll("[data-cew-desc]").forEach(
    (el) =>
      (el.oninput = () => {
        state.cew[el.dataset.cewDesc].description = el.value;
        save(true);
        updateProgress();
      }),
  );
  document
    .querySelectorAll("[data-remove-file]")
    .forEach((el) => (el.onclick = () => removeFile(el.dataset.removeFile)));
  document.querySelectorAll("[data-theme]").forEach(
    (el) =>
      (el.onclick = () => {
        state.custom.theme = el.dataset.theme;
        save(true);
        render();
      }),
  );
  document
    .querySelectorAll("[data-add]")
    .forEach((el) => (el.onclick = () => addItem(el.dataset.add)));
  document.querySelectorAll("[data-remove-custom]").forEach(
    (el) =>
      (el.onclick = () => {
        state.settings.customSections.splice(+el.dataset.removeCustom, 1);
        save(true);
        render();
      }),
  );
  document.querySelectorAll("[data-remove-sample]").forEach(
    (el) =>
      (el.onclick = () => {
        state.workSamples.splice(+el.dataset.removeSample, 1);
        save(true);
        render();
      }),
  );
  document.querySelectorAll("[data-remove-entry]").forEach(
    (el) =>
      (el.onclick = () => {
        const [k, i] = el.dataset.removeEntry.split(".");
        state.accomplishments[k].splice(+i, 1);
        save(true);
        render();
      }),
  );
  document.querySelectorAll("[data-remove-credential]").forEach(
    (el) =>
      (el.onclick = () => {
        state.credentials.splice(+el.dataset.removeCredential, 1);
        save(true);
        render();
      }),
  );
  document.querySelectorAll("[data-remove-rec]").forEach(
    (el) =>
      (el.onclick = () => {
        state.recommendations.splice(+el.dataset.removeRec, 1);
        save(true);
        render();
      }),
  );
}
function addItem(kind) {
  if (kind === "sample")
    state.workSamples.push({
      id: id("work"),
      title: "",
      description: "",
      date: "",
      classOrProject: "",
      skills: [],
      file: null,
      link: "",
      reflection: "",
      publicationStatus: "draft",
    });
  else if (kind === "credential")
    state.credentials.push({
      id: id("credential"),
      name: "",
      organization: "",
      date: "",
      description: "",
      file: null,
      publicationStatus: "draft",
    });
  else if (kind === "recommendation")
    state.recommendations.push({
      id: id("recommendation"),
      authorName: "",
      relationship: "",
      date: "",
      file: null,
      publicationStatus: "draft",
    });
  else if (kind === "customSection")
    state.settings.customSections.push({
      id: id("custom"),
      title: "",
      description: "",
      content: "",
      files: [],
      position: state.settings.customSections.length,
    });
  else state.accomplishments[kind].push(achievement());
  save(true);
  render();
}
function handleFile(el) {
  const file = el.files[0];
  if (!file) return;
  const path = el.dataset.file.split(".");
  let target = state;
  path.slice(0, -1).forEach((p) => {
    if (!target[p]) target[p] = {};
    target = target[p];
  });
  const key = path.at(-1);
  const metadata = {
    fileName: file.name,
    fileType: file.type,
    fileData: null,
    uploadedAt: new Date().toISOString(),
  };
  if (target === state.careersafe) {
    target[key].file = file.name;
  } else if (
    target[key] &&
    typeof target[key] === "object" &&
    "file" in target[key]
  ) {
    target[key].file = metadata;
  } else if (target[key] && typeof target[key] === "object") {
    Object.assign(target[key], metadata);
  } else {
    target[key] = file.name;
  }
  save(true);
  render();
  toast("File recorded locally. The original file stays on this device.");
}
function removeFile(path) {
  const parts = path.split(".");
  let parent = state;
  parts.slice(0, -1).forEach((part) => (parent = parent[part]));
  const key = parts[parts.length - 1];
  const current = parent[key];
  const store = portfolioStore();
  if (store) {
    const attachment =
      current && typeof current === "object" && "file" in current
        ? current.file
        : current;
    if (attachment?.fileRef) store.removeFile(attachment.fileRef);
  }
  if (parent === state.careersafe) {
    parent[key].file = "";
  } else if (current && typeof current === "object" && "file" in current) {
    current.file = null;
  } else if (current && typeof current === "object" && "fileName" in current) {
    current.fileName = "";
    current.fileType = "";
    current.fileRef = "";
    current.fileData = null;
  } else {
    parent[key] = Array.isArray(current) ? [] : "";
  }
  save(true);
  render();
}
function closeMenu() {
  $("#sidebar").classList.remove("open");
}
function ensurePortableShape(portfolio) {
  if (!portfolio || typeof portfolio !== "object") portfolio = defaultState();
  const defaults = defaultState();
  const migrateExistingVisibility = portfolio.metadata?.publicationMigrationVersion !== 1;
  const publicationStatus = (record, hasContent) => {
    if (record?.publicationStatus === "published") return "published";
    if (record?.publicationStatus === "draft" && !migrateExistingVisibility) return "draft";
    return hasContent ? "published" : "draft";
  };
  portfolio.student = { ...defaults.student, ...(portfolio.student || {}) };
  portfolio.program = { ...defaults.program, ...(portfolio.program || {}) };
  portfolio.aboutMe = { ...defaults.aboutMe, ...(portfolio.aboutMe || {}) };
  portfolio.theme ??= defaults.theme;
  const achievementData = portfolio.accomplishments && typeof portfolio.accomplishments === "object"
    ? portfolio.accomplishments
    : {};
  achievementData.awards = mergeAchievementRecords(
    achievementData.awards,
    portfolio.awards,
  );
  achievementData.accomplishments = mergeAchievementRecords(
    achievementData.accomplishments,
    achievementData["0"] ? { 0: achievementData["0"] } : null,
  );
  achievementData.extracurriculars = mergeAchievementRecords(
    achievementData.extracurriculars,
    portfolio.activities,
  );
  achievementData.serviceExperiences = mergeAchievementRecords(
    achievementData.serviceExperiences,
    portfolio.service,
  );
  delete achievementData["0"];
  portfolio.accomplishments = achievementData;
  delete portfolio.awards;
  delete portfolio.activities;
  delete portfolio.service;

  portfolio.hiringDocuments = portfolio.hiringDocuments || {};
  for (const [legacyKey, documentKey] of [["cover", "coverLetter"], ["resume", "resume"]]) {
    if (!portfolio.hiringDocuments[documentKey] && portfolio[legacyKey])
      portfolio.hiringDocuments[documentKey] = typeof portfolio[legacyKey] === "object"
        ? { ...portfolio[legacyKey] }
        : { fileName: portfolio[legacyKey] };
    delete portfolio[legacyKey];
  }
  for (const key of ["resume", "coverLetter", "standardApplication"]) {
    const source = portfolio.hiringDocuments[key] || {};
    const nested = source.file && typeof source.file === "object"
      ? { ...source.file }
      : typeof source.file === "string" && source.file
        ? { fileName: source.file }
        : null;
    const legacy = attachmentFromLegacy(source);
    const file = nested || legacy;
    const attachments = Array.isArray(source.attachments) ? [...source.attachments] : [];
    const competingResumeFile = key === "resume" && legacy && nested &&
      ((nested.fileRef && legacy.fileRef && nested.fileRef !== legacy.fileRef) ||
        (!nested.fileRef || !legacy.fileRef) && nested.fileName !== legacy.fileName);
    if (competingResumeFile &&
      !attachments.some((item) => item?.fileRef && item.fileRef === legacy.fileRef))
      attachments.push(legacy);
    portfolio.hiringDocuments[key] = {
      id: source.id || id("document"),
      title: source.title ?? ({ resume: "Resume", coverLetter: "Cover Letter", standardApplication: "Standard Application" }[key]),
      description: source.description || "",
      uploadedAt: source.uploadedAt ?? file?.uploadedAt ?? null,
      file: file || null,
      publicationStatus: publicationStatus(source, Boolean(file?.fileRef || file?.fileName || attachments.length)),
      ...(key === "resume" ? { attachments } : {}),
    };
  }
  for (const record of Object.values(portfolio.hiringDocuments))
    if (record && typeof record === "object") record.publicationStatus = publicationStatus(record, Boolean(record.file?.fileRef || record.file?.fileName || record.fileRef || record.fileName));

  const recommendationRecords = Array.isArray(portfolio.recommendations)
    ? portfolio.recommendations
    : portfolio.recommendations ? [portfolio.recommendations] : [];
  portfolio.recommendations = recommendationRecords.map((record) => {
    const source = record && typeof record === "object" ? record : {};
    const file = source.file && typeof source.file === "object"
      ? source.file
      : attachmentFromLegacy(source);
    return {
      ...source,
      id: source.id || id("recommendation"),
      authorName: source.authorName || source.recommenderName || "",
      relationship: source.relationship || source.recommenderRole || "",
      date: source.date || "",
      file: file || null,
      publicationStatus: publicationStatus(source, Boolean(source.title || source.authorName || source.file?.fileRef || source.file?.fileName || file?.fileRef || file?.fileName)),
      ...(source.description ? { description: source.description } : {}),
    };
  });

  const skillNamesById = new Map();
  const existingSkills = Array.isArray(portfolio.aboutMe.skills) ? portfolio.aboutMe.skills : splitList(portfolio.aboutMe.skills);
  portfolio.aboutMe.skills = existingSkills.map((skill) => {
    const entry = typeof skill === "string" ? { id: id("skill"), name: skill } : { ...skill };
    entry.id = entry.id || id("skill");
    entry.name = String(entry.name || "");
    skillNamesById.set(entry.id, entry.name);
    return entry;
  });
  portfolio.workSamples = Array.isArray(portfolio.workSamples) ? portfolio.workSamples : [];
  portfolio.workSamples.forEach((record) => { record.publicationStatus = publicationStatus(record, Boolean(record.title || record.description || record.reflection || record.link || record.file?.fileRef || record.file?.fileName)); });
  linkWorkSampleSkills(portfolio.aboutMe.skills, portfolio.workSamples);

  portfolio.sections = Array.isArray(portfolio.sections) ? portfolio.sections : [];
  portfolio.settings = { ...defaults.settings, ...(portfolio.settings || {}) };
  if (!Array.isArray(portfolio.settings.sectionOrder) || !portfolio.settings.sectionOrder.length)
    portfolio.settings.sectionOrder = portfolio.sections.length ? portfolio.sections : defaults.settings.sectionOrder;
  delete portfolio.sections;
  portfolio.settings.customSections = Array.isArray(portfolio.settings.customSections)
    ? portfolio.settings.customSections
    : [];

  portfolio.supportingAcademics = {
    ...defaults.supportingAcademics,
    ...(portfolio.supportingAcademics || {}),
  };
  portfolio.supportingAcademics.postSecondaryPlan = {
    ...defaults.supportingAcademics.postSecondaryPlan,
    ...(portfolio.supportingAcademics.postSecondaryPlan || {}),
  };
  for (const key of ["reflections", "potentialEmployers", "postSecondaryOpportunities"])
    if (!Array.isArray(portfolio.supportingAcademics[key])) portfolio.supportingAcademics[key] = [];
  portfolio.supportingAcademics.instructionalAssistant = {
    ...defaults.supportingAcademics.instructionalAssistant,
    ...(portfolio.supportingAcademics.instructionalAssistant || {}),
  };
  portfolio.supportingAcademics.instructor = {
    ...defaults.supportingAcademics.instructor,
    ...(portfolio.supportingAcademics.instructor || {}),
  };
  portfolio.supportingAcademics.documents =
    portfolio.supportingAcademics.documents || {};
  portfolio.careerSafe = portfolio.careerSafe || {};
  if (!Array.isArray(portfolio.careerSafe.entries))
    portfolio.careerSafe.entries = Object.keys(portfolio.careerSafe)
      .filter((key) => /^careerSafe\d+$/.test(key))
      .map((key, index) => {
        const item = portfolio.careerSafe[key];
        return {
          id: id("career-safe"),
          category: String(index + 1),
          selectedOption: item.selectedOption || "",
          certificate: item.certificate || null,
          completionDate: item.completionDate || "",
          notes: item.notes || "",
        };
      });
  for (let index = 0; index < 4; index++) {
    const key = `careerSafe${index + 1}`;
    const legacy = portfolio.careerSafe[key];
    if (legacy && typeof legacy === "object") {
      const existing = portfolio.careerSafe.entries.find((entry) => String(entry.category) === String(index + 1));
      if (existing) {
        existing.selectedOption ||= legacy.selectedOption || "";
        existing.certificate ||= legacy.certificate || null;
        existing.completionDate ||= legacy.completionDate || "";
        existing.notes ||= legacy.notes || "";
      } else if (legacy.selectedOption || legacy.certificate || legacy.completionDate || legacy.notes) {
        portfolio.careerSafe.entries.push({
          id: id("career-safe"),
          category: String(index + 1),
          selectedOption: legacy.selectedOption || "",
          certificate: legacy.certificate || null,
          completionDate: legacy.completionDate || "",
          notes: legacy.notes || "",
        });
      }
      const empty = !legacy.selectedOption && !legacy.certificate && !legacy.completionDate && !legacy.notes;
      if (empty || existing || portfolio.careerSafe.entries.some((entry) => String(entry.category) === String(index + 1)))
        delete portfolio.careerSafe[key];
    }
  }
  portfolio.credentials = Array.isArray(portfolio.credentials) ? portfolio.credentials : [];
  portfolio.credentials.forEach((record) => { record.publicationStatus = publicationStatus(record, Boolean(record.name || record.organization || record.description || record.file?.fileRef || record.file?.fileName)); });
  portfolio.metadata = { ...defaults.metadata, ...(portfolio.metadata || {}) };
  portfolio.metadata.publicationMigrationVersion = 1;
  for (const key of ["awards", "accomplishments", "extracurriculars", "serviceExperiences"])
    if (!Array.isArray(portfolio.accomplishments[key])) portfolio.accomplishments[key] = [];
  for (const records of Object.values(portfolio.accomplishments))
    if (Array.isArray(records)) records.forEach((record) => { if (record && typeof record === "object") record.publicationStatus = publicationStatus(record, Boolean(record.title || record.name || record.description || record.organization)); });
  for (const entry of portfolio.careerSafe.entries) entry.publicationStatus = publicationStatus(entry, Boolean(entry.selectedOption || entry.certificate?.fileRef || entry.certificate?.fileName || entry.notes));
  for (const record of Object.values(portfolio.supportingAcademics.documents))
    if (record && typeof record === "object") record.publicationStatus = publicationStatus(record, Boolean(record.title || record.description || record.file?.fileRef || record.file?.fileName || record.fileRef || record.fileName));
  portfolio.cewStandards = {
    ...defaults.cewStandards,
    ...(portfolio.cewStandards || {}),
  };
  const academicDocuments = portfolio.supportingAcademics.documents;
  const cewMatches = {
    "Post-secondary plan": [academicDocuments.postSecondary?.id].filter(Boolean),
    "Potential employers": [academicDocuments.employers?.id].filter(Boolean),
    "Work samples": portfolio.workSamples.map((sample) => sample.id).filter(Boolean),
    "Career reflections": ["growth", "reflection1", "reflection2"]
      .map((key) => academicDocuments[key]?.id).filter(Boolean),
    "Career goal": [],
  };
  for (const standard of Object.values(portfolio.cewStandards)) {
    if (!Array.isArray(standard.evidence)) standard.evidence = [];
    const evidence = [];
    for (const item of standard.evidence) {
      const matches = item.portfolioItemId ? [] : cewMatches[item.portfolioItemType] || [];
      if (!matches.length) {
        evidence.push(item);
      } else if (matches.length === 1) {
        evidence.push({ ...item, portfolioItemId: matches[0] });
      } else {
        for (const itemId of matches) evidence.push({ ...item, portfolioItemId: itemId });
      }
    }
    standard.evidence = evidence;
  }
  for (const record of portfolio.recommendations) record.date = normalizeDate(record.date);
  normalizePortfolioDates(portfolio);
  const dateOrder = (record) => /^\d{4}-\d{2}-\d{2}$/.test(record?.date || "")
    ? Date.parse(`${record.date}T00:00:00Z`)
    : Number.NEGATIVE_INFINITY;
  const sortNewestFirst = (a, b) => dateOrder(b) - dateOrder(a);
  portfolio.workSamples.sort(sortNewestFirst);
  portfolio.credentials.sort(sortNewestFirst);
  portfolio.schemaVersion = 1;
  return portfolio;
}
function academicDocument(key, title) {
  return (
    state.supportingAcademics.documents[key] ||
    (state.supportingAcademics.documents[key] = {
      id: id("academic"),
      title,
      description: "",
      fileName: "",
      fileType: "",
      fileData: null,
      uploadedAt: null,
      publicationStatus: "draft",
    })
  );
}
function academicUpload(key, title) {
  const item = academicDocument(key, title);
  return `<section class="section-card"><div class="repeater-header"><div><h2>${title}</h2><p>Describe the evidence and attach its PDF, DOC, or DOCX file.</p></div><span class="requirement-status ${item.fileName ? "done" : ""}">${item.fileName ? "Attached" : "Document required"}</span></div><label class="field-label">Description<textarea data-academic-description="${key}" placeholder="Describe the academic evidence and what it demonstrates.">${esc(item.description)}</textarea></label>${fileUpload("", item.fileName ? "Replace document" : "Upload document", "supportingAcademics.documents." + key)}${publicationControl(item, `supportingAcademics.documents.${key}`, "academic")}</section>`;
}
function careerSafeView() {
  const choices = [
    "Teamwork",
    "Interview Skills Certification",
    "Time Management",
    "Cybersecurity",
    "Materials Management",
    "Critical Thinking",
    "Human Resource Management",
    "Communication Skills",
    "Written Communication",
    "Workplace Financial Management",
    "Personal Financial Management",
  ];
  const entries = state.careerSafe.entries;
  return (
    heading(
      "07 · CareerSafe",
      "CareerSafe certifications",
      "Add every certification you have completed. You can add multiple entries in the same area.",
    ) +
    entries
      .map(
        (item, index) =>
          `<section class="section-card"><div class="repeater-header"><div><p class="section-kicker">CareerSafe evidence ${index + 1}</p><h2>Certification details</h2></div>${index > 3 ? `<button class="remove-button" data-remove-safe="${index}">Remove</button>` : ""}</div><div class="field-grid"><label class="field-label">Area or category<select data-safe-category="${index}"><option value="">Choose an area</option>${["1", "2", "3", "4"].map((category) => `<option value="${category}" ${item.category === category ? "selected" : ""}>CareerSafe ${category}</option>`).join("")}</select></label><label class="field-label">Certification<select data-safe-entry="${index}"><option value="">Choose a certification</option>${choices.map((choice) => `<option ${item.selectedOption === choice ? "selected" : ""}>${choice}</option>`).join("")}</select></label><label class="field-label">Completion date<input data-safe-date="${index}" value="${esc(item.completionDate || "")}" placeholder="Month, year"></label></div>${fileUpload("", item.certificate?.fileName ? "Replace certificate" : "Upload certificate", "careerSafe.entries." + index + ".certificate")}<label class="field-label">Notes<textarea data-safe-notes="${index}" placeholder="Optional context about this certification.">${esc(item.notes || "")}</textarea></label>${publicationControl(item, `careerSafe.${index}`, "careerSafe")}</section>`,
      )
      .join("") +
    '<button class="add-button" data-add="careerSafe">+ Add another CareerSafe entry</button>'
  );
}
function academicsView() {
  const a = state.supportingAcademics;
  return (
    heading(
      "08 · Look ahead",
      "Supporting academics",
      "Keep completed academic assignments here as PDF, DOC, or DOCX files so you can return to them later.",
    ) +
    academicUpload("postSecondary", "Post-secondary plan") +
    academicUpload("growth", "Co-op / SkillsUSA / ECTS growth reflection") +
    academicUpload("reflection1", "ATD / field trip reflection 1") +
    academicUpload("reflection2", "ATD / field trip reflection 2") +
    academicUpload("employment", "Standard application for employment") +
    academicUpload("employers", "Potential employers") +
    academicUpload("education", "Post-secondary education opportunities") +
    academicUpload("home", "Home school reflection (optional)") +
    `<section class="section-card"><h2>Checkoffs</h2><p>Editable sign-off fields for your portfolio review.</p><div class="field-grid"><label class="field-label">Instructional assistant name<input data-bind="academics.iaName" value="${esc(a.instructionalAssistant?.name || "")}"></label><label class="field-label">Date<input data-bind="academics.iaDate" value="${esc(a.instructionalAssistant?.date || "")}"></label><label class="field-label">Instructor name<input data-bind="academics.instructorName" value="${esc(a.instructor?.name || "")}"></label><label class="field-label">Date<input data-bind="academics.instructorDate" value="${esc(a.instructor?.date || "")}"></label></div></section>`
  );
}
function addPortableBindings() {
  const originalBindEditor = bindEditor;
  bindEditor = function () {
    originalBindEditor();
    document
      .querySelectorAll("[data-file]")
      .forEach((el) => (el.onchange = () => portableFileHandler(el)));
    document.querySelectorAll("[data-safe-category]").forEach(
      (el) =>
        (el.onchange = () => {
          state.careerSafe.entries[+el.dataset.safeCategory].category =
            el.value;
          save(true);
        }),
    );
    document.querySelectorAll("[data-safe-entry]").forEach(
      (el) =>
        (el.onchange = () => {
          state.careerSafe.entries[+el.dataset.safeEntry].selectedOption =
            el.value;
          save(true);
          render();
        }),
    );
    document.querySelectorAll("[data-safe-date]").forEach(
      (el) =>
        (el.oninput = () => {
          state.careerSafe.entries[+el.dataset.safeDate].completionDate =
            el.value;
          save(true);
        }),
    );
    document.querySelectorAll("[data-safe-notes]").forEach(
      (el) =>
        (el.oninput = () => {
          state.careerSafe.entries[+el.dataset.safeNotes].notes = el.value;
          save(true);
        }),
    );
  };
  const originalAddItem = addItem;
  addItem = function (kind) {
    if (kind === "careerSafe") {
      state.careerSafe.entries.push({
        id: id("career-safe"),
        category: "",
        selectedOption: "",
        certificate: null,
        completionDate: "",
        notes: "",
        publicationStatus: "draft",
      });
      save(true);
      render();
      return;
    }
    originalAddItem(kind);
  };
  document.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-safe]");
    if (remove) {
      state.careerSafe.entries.splice(+remove.dataset.removeSafe, 1);
      save(true);
      render();
    }
  });
}
async function portableFileHandler(el) {
  const file = el.files[0];
  if (!file) return;
  const extension = (file.name || "").toLowerCase().split(".").pop();
  const isProfileImage = el.dataset.file === "student.image";
  const allowedExtensions = isProfileImage
    ? ["jpg", "jpeg", "png", "gif", "webp"]
    : ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "webp"];
  if (!allowedExtensions.includes(extension)) {
    toast(
      isProfileImage
        ? "Choose a PNG, JPG, JPEG, GIF, or WEBP image."
        : "Choose a PDF, DOC, DOCX, or image file.",
    );
    return;
  }
  const store = portfolioStore();
  if (!store) {
    toast("File uploads are available in the desktop app.");
    return;
  }
  try {
    const path = el.dataset.file.split(".");
    let target = state;
    path.slice(0, -1).forEach((part) => {
      if (!target[part]) target[part] = {};
      target = target[part];
    });
    const key = path.at(-1);
    const existing =
      target[key] && typeof target[key] === "object" && "file" in target[key]
        ? target[key].file
        : target[key];
    const bytes = new Uint8Array(await file.arrayBuffer());
    const metadata = await store.saveFile({
      fileName: file.name,
      fileType: file.type || getMimeType(extension),
      bytes,
      previousRef: existing?.fileRef || "",
    });
    if (target[key] && typeof target[key] === "object" && "file" in target[key])
      target[key].file = metadata;
    else if (target[key] && typeof target[key] === "object")
      Object.assign(target[key], metadata);
    else target[key] = metadata;
    save(true);
    render();
    toast(`${file.name} saved in the app data folder.`);
  } catch (error) {
    toast(error.message || "The file could not be saved on this device.");
  }
}
function getMimeType(extension) {
  const types = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return types[extension] || "application/octet-stream";
}
async function exportPdf() {
  const store = portfolioStore();
  if (!store) {
    toast("PDF export is available in the desktop app.");
    return;
  }
  const button = document.querySelector('[data-action="print"]');
  if (button) {
    button.disabled = true;
    button.textContent = "Preparing PDF…";
  }
  try {
    const name = (
      state.student.displayName ||
      state.student.firstName ||
      "ects-career-portfolio"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    if (await store.exportPdf(state, name)) toast("Portfolio PDF saved.");
  } catch (error) {
    toast(error.message || "The PDF could not be generated.");
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = 'Export / Print PDF <span aria-hidden="true">↗</span>';
    }
  }
}
async function previewPortfolio() {
  const store = portfolioStore();
  if (!store?.preview) {
    toast("Portfolio preview is available in the desktop app.");
    return;
  }
  try {
    await store.preview(state, portfolioContents());
  } catch (error) {
    toast(error.message || "The portfolio preview could not be opened.");
  }
}
async function downloadBackup() {
  const store = portfolioStore();
  if (!store) {
    toast("Saving portfolio files is available in the desktop app.");
    return;
  }
  const name = `ects-career-portfolio-${(state.student.displayName || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  try {
    if (await store.exportArchive(state, name))
      toast("ECTS portfolio file saved.");
  } catch (error) {
    toast(error.message || "The portfolio file could not be saved.");
  }
}
async function loadBackup() {
  const store = portfolioStore();
  if (!store) {
    toast("Opening portfolio files is not available.");
    return;
  }
  if (
    state.student.name &&
    !confirm(
      "Open another portfolio and replace the one currently open? Any unsaved changes will be discarded.",
    )
  )
    return;
  try {
    const portfolio = await store.importArchive();
    if (!portfolio) return;
    state = addCompatibilityAliases(ensurePortableShape(portfolio));
    save(true);
    startApp();
    toast("Portfolio opened successfully.");
  } catch (error) {
    toast(error.message || "That portfolio file could not be opened.");
  }
}
function reset() {
  if (
    confirm("Close and clear the current portfolio and its local attachments?")
  ) {
    const store = portfolioStore();
    if (store) store.clearCurrent();
    state = addCompatibilityAliases(ensurePortableShape(defaultState()));
    show("landing");
    toast("Portfolio closed.");
  }
}
state = ensurePortableShape(state);
function checklistItemComplete(id) {
  return portfolioChecklistItems().find((item) => item.id === id)?.done || false;
}
function checklistGroupComplete(group) {
  const requiredItems = portfolioChecklistItems().filter(
    (item) => item.group === group && !item.optional,
  );
  return requiredItems.length > 0 && requiredItems.every((item) => item.done);
}
isSectionDone = function (section) {
  if (section === "checklist") return progress() >= 100;
  if (section === "customize") return true;
  if (section === "about") return checklistGroupComplete("about");
  if (section === "documents")
    return ["cover-letter", "resume", "recommendation-1", "recommendation-2"].every(checklistItemComplete);
  if (section === "samples")
    return Array.from({ length: 5 }, (_, index) => checklistItemComplete(`work-sample-${index + 1}`)).every(Boolean);
  if (section === "credentials") return checklistItemComplete("credential-1");
  if (section === "accomplishments") return checklistItemComplete("accomplishments");
  if (section === "careersafe")
    return Array.from({ length: 4 }, (_, index) => checklistItemComplete(`careersafe-${index + 1}`)).every(Boolean);
  if (section === "academics") return checklistGroupComplete("academics");
  if (section === "cew") return checklistGroupComplete("cew");
  return false;
};
progress = function () {
  const checks = ["about", "documents", "samples", "credentials", "accomplishments", "careersafe", "academics", "cew"]
    .map(isSectionDone);
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};
addPortableBindings();
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const action = a.dataset.action;
  if (action === "start") start();
  if (action === "home") {
    e.preventDefault();
    show("landing");
    closeMenu();
  }
  if (action === "save") save();
  if (action === "preview") previewPortfolio();
  if (action === "download") downloadBackup();
  if (action === "load") loadBackup();
  if (action === "print") exportPdf();
  if (action === "menu") $("#sidebar").classList.toggle("open");
  if (action === "requirements") {
    current = "checklist";
    renderNav();
    render();
  }
  if (action === "reset") reset();
});
populatePrograms();
$("#setup-form").onsubmit = (e) => {
  e.preventDefault();
  state.student.name = $("#setup-name").value.trim();
  state.student.year = $("#setup-year").value;
  state.program.id = $("#setup-program").value;
  state.program.name =
    PROGRAMS.find(([id]) => id === state.program.id)?.[1] || "";
  syncProgram();
  save(true);
  startApp();
};
if (state.student.name) startApp();
else show("landing");
const store = portfolioStore();
if (store) {
  store
    .loadCurrent()
    .then((saved) => {
      if (!saved) return;
      state = addCompatibilityAliases(ensurePortableShape(saved));
      save(true);
      if (state.student.name) startApp();
      else show("landing");
    })
    .catch(() => toast("Unable to load the saved portfolio from this device."));
}

document.addEventListener("input", (event) => {
  if (event.target.matches('[data-bind="program.name"]')) {
    state.program.customNameEntered = true;
    save(true);
    const header = $("#header-program");
    if (header) header.textContent = event.target.value || "Program";
  }
});
