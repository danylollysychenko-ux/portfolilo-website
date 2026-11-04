# ECTS Career Portfolio Creator

A standalone Electron desktop app for creating ECTS career portfolios.

## Run the desktop app

```powershell
npm install
npm start
```

To package a portable Windows executable:

```powershell
npm run package
```

Portfolio data is saved in Electron's application-data folder. Uploaded documents are saved there as individual files.

Use **Save Portfolio** to create a `.ects-portfolio` ZIP file. It includes `portfolio.json`, a `manifest.json` relating attachments to the portfolio, and the attachment files. Use **Open Portfolio** to load one. The app asks before replacing a named portfolio.

## Portfolio contents

- Guided setup and ECTS program selector
- About Me, hiring documents, work samples, credentials, accomplishments, CareerSafe, supporting academics
- Local file attachments, listed in their portfolio section and in the preview; PDFs are shown inline in the preview
- Portable `.ects-portfolio` open and save workflow
- Theme and accent controls, live preview, and print to PDF

## Quality checks and portfolio order

Portfolio records are included in the preview by default. Each supported record editor shows quality notes (such as missing dates or placeholder copy) to help improve the content. These notes do not change visibility. Existing `.ects-portfolio` files remain compatible; legacy visibility values are normalized to published.

The preview groups work into About Me, Projects & Work Samples, Resume & Career Documents, Skills/Credentials/Achievements, Education & Career Readiness, and Recommendations & Contact. The JSON record fields and attachment references remain compatible with existing `.ects-portfolio` imports; `publicationStatus` is optional and defaults to `published` when absent.
