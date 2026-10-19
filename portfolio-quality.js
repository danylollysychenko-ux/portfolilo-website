(() => {
  const placeholder = (value) => {
    const text = String(value ?? "").trim();
    return !text || /^(?:n\/?a|none|test(?:ing)?|todo|tbd|unknown|asdf+|qwer+|xxx+|idk)$/i.test(text) || /lorem ipsum|asdf|qwer|zxcv/i.test(text);
  };
  const issues = (kind, record = {}) => {
    const title = record.title || record.name || record.authorName || record.selectedOption || "";
    const result = [];
    if (placeholder(title)) result.push("Add a meaningful title or name.");
    if (record.description && placeholder(record.description)) result.push("Replace placeholder description text.");
    if (!record.date && ["workSample", "credential", "achievement", "recommendation"].includes(kind)) result.push("Date is missing.");
    if (record.link && !/^https?:\/\//i.test(record.link)) result.push("Link should start with http:// or https://.");
    if (kind === "recommendation" && !record.file?.fileRef && !record.file?.fileName) result.push("Attach the recommendation letter.");
    if (kind === "academic" && !(record.file?.fileRef || record.file?.fileName || record.fileRef || record.fileName)) result.push("Attach the academic document.");
    if (kind === "careerSafe" && !(record.certificate?.fileRef || record.certificate?.fileName)) result.push("Attach the certificate when available.");
    if (kind === "workSample" && !record.description) result.push("Add a short description of the work.");
    if (kind === "credential" && !record.organization) result.push("Add the issuing organization.");
    return result;
  };
  const publicRecord = (record, kind) => Boolean(record && record.publicationStatus === "published" && !issues(kind, record).some((item) => /placeholder description/.test(item) || (/meaningful title/.test(item) && !(kind === "recommendation" && !record.authorName))));
  window.PortfolioQuality = { placeholder, issues, publicRecord };
})();
