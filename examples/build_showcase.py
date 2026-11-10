#!/usr/bin/env python3
"""Build a fictional, importable showcase portfolio for the desktop app."""
from __future__ import annotations

import copy
import json
import struct
import zlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[1]
PROFILE_REF = "11111111-2222-4333-8444-555555555555"
REPORT_REF = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
PROFILE_PATH = "images/demo-profile.png"
REPORT_PATH = "projects/climate-data-report.pdf"
FIXED_ZIP_TIME = (2020, 1, 1, 0, 0, 0)


def png_chunk(kind: bytes, data: bytes) -> bytes:
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def make_demo_avatar() -> bytes:
    size = 384
    pixels = bytearray(size * size * 3)

    def paint(x: int, y: int, color: tuple[int, int, int]) -> None:
        if 0 <= x < size and 0 <= y < size:
            offset = (y * size + x) * 3
            pixels[offset:offset + 3] = bytes(color)

    def ellipse(x: int, y: int, cx: float, cy: float, rx: float, ry: float) -> bool:
        return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1

    for y in range(size):
        for x in range(size):
            blend = y / size
            color = (int(224 - 10 * blend), int(241 - 4 * blend), int(234 + 6 * blend))
            if ellipse(x, y, 326, 66, 116, 116):
                color = (216, 235, 226)
            if ellipse(x, y, 190, 432, 250, 184):
                color = (39, 68, 66)
            if 158 <= x <= 224 and 230 <= y <= 326:
                color = (193, 127, 101)
            if ellipse(x, y, 190, 205, 132, 157):
                color = (44, 53, 50)
            if ellipse(x, y, 190, 229, 105, 130):
                color = (231, 180, 151)
            if ellipse(x, y, 80, 224, 25, 39) or ellipse(x, y, 300, 224, 25, 39):
                color = (220, 163, 136)
            # Hair cap and side locks frame the face while keeping the portrait simple.
            if ellipse(x, y, 190, 164, 140, 118) and y < 170:
                color = (38, 52, 50)
            if ellipse(x, y, 71, 188, 28, 87) or ellipse(x, y, 309, 188, 28, 87):
                color = (38, 52, 50)
            # Shirt collar and a light undershirt add a little definition.
            if 149 <= y <= 205 and abs(x - 190) < (y - 145) * 0.84:
                color = (238, 240, 230)
            # Eyes, brows, nose, and a calm smile.
            if ellipse(x, y, 151, 218, 10, 5) or ellipse(x, y, 229, 218, 10, 5):
                color = (45, 54, 51)
            if ellipse(x, y, 151, 216, 3, 3) or ellipse(x, y, 229, 216, 3, 3):
                color = (247, 239, 224)
            if ellipse(x, y, 190, 247, 5, 20):
                color = (205, 148, 124)
            if 165 <= x <= 215 and abs(y - (272 + ((x - 190) / 25) ** 2 * 7)) <= 2:
                color = (143, 72, 68)
            paint(x, y, color)

    rows = b"".join(b"\x00" + pixels[y * size * 3:(y + 1) * size * 3] for y in range(size))
    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", header) + png_chunk(b"IDAT", zlib.compress(rows, 9)) + png_chunk(b"IEND", b"")


def pdf_text(x: int, y: int, size: int, text: str, color: str = "0.12 0.23 0.25") -> str:
    safe = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    return f"BT {color} rg /F1 {size} Tf {x} {y} Td ({safe}) Tj ET\n"


def make_demo_report() -> bytes:
    commands = [
        "0.91 0.96 0.94 rg 0 0 612 792 re f\n",
        "0.08 0.36 0.31 rg 0 692 612 100 re f\n",
        pdf_text(46, 748, 11, "ECTS CAREER PORTFOLIO  /  DEMONSTRATION PROJECT", "1 1 1"),
        pdf_text(46, 710, 23, "Climate Data Explorer (DEMO)", "1 1 1"),
        pdf_text(46, 642, 13, "EXAMPLE ATTACHMENT  -  FICTIONAL DATA AND PROJECT", "0.08 0.36 0.31"),
        pdf_text(46, 608, 11, "This one-page report is included only to demonstrate how a project attachment", "0.22 0.30 0.30"),
        pdf_text(46, 590, 11, "appears in the portfolio preview. It is not student work or a real assessment.", "0.22 0.30 0.30"),
        "0.08 0.36 0.31 RG 46 558 m 566 558 l S\n",
        pdf_text(46, 526, 14, "Sample monthly temperature data", "0.08 0.36 0.31"),
        pdf_text(54, 493, 10, "MONTH", "0.34 0.40 0.40"),
        pdf_text(232, 493, 10, "AVERAGE", "0.34 0.40 0.40"),
        pdf_text(374, 493, 10, "OBSERVATIONS", "0.34 0.40 0.40"),
        "0.80 0.85 0.83 RG 46 481 m 566 481 l S\n",
    ]
    data = [("January", "31 F", "31"), ("February", "35 F", "28"), ("March", "46 F", "31"), ("April", "58 F", "30")]
    for index, row in enumerate(data):
        y = 455 - index * 34
        commands.extend([
            pdf_text(54, y, 11, row[0]),
            pdf_text(232, y, 11, row[1]),
            pdf_text(374, y, 11, row[2]),
            "0.88 0.91 0.89 RG " + str(46) + " " + str(y - 11) + " m 566 " + str(y - 11) + " l S\n",
        ])
    commands.extend([
        pdf_text(46, 286, 14, "Example learning outcomes", "0.08 0.36 0.31"),
        pdf_text(54, 256, 11, "- Read rows from a small data file and calculate summary values."),
        pdf_text(54, 234, 11, "- Compare monthly averages and present results in a simple table."),
        pdf_text(54, 212, 11, "- Note: all dates, measurements, and project details here are fictional."),
        "0.08 0.36 0.31 rg 0 0 612 72 re f\n",
        pdf_text(46, 39, 10, "SAMPLE ONLY - Replace this file and all demo entries with genuine portfolio work.", "1 1 1"),
    ])
    stream = "".join(commands).encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"endstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    pdf = bytearray(b"%PDF-1.4\n%Demo\n")
    offsets = [0]
    for number, body in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode("ascii"))
        pdf.extend(body + b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode("ascii"))
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii"))
    return bytes(pdf)


def demo_file(file_ref: str, file_name: str, file_type: str) -> dict:
    return {"fileRef": file_ref, "fileName": file_name, "fileType": file_type, "uploadedAt": "2025-06-01"}


def main() -> None:
    with (PROJECT_ROOT / "portfolio.json").open(encoding="utf-8") as source:
        portfolio = copy.deepcopy(json.load(source))
    profile_bytes = make_demo_avatar()
    report_bytes = make_demo_report()
    (HERE / "assets").mkdir(parents=True, exist_ok=True)
    (HERE / "assets" / "demo-profile.png").write_bytes(profile_bytes)
    (HERE / "assets" / "climate-data-report.pdf").write_bytes(report_bytes)

    portfolio["id"] = "portfolio-demo-showcase"
    portfolio["student"] = {
        "firstName": "Demo",
        "lastName": "Student",
        "displayName": "Demo Student",
        "graduationYear": 2027,
        "profileImagePosition": {"x": 50, "y": 46},
        "profileImage": {
            "id": "demo-profile-image",
            "title": "Illustrated demo profile image",
            "description": "A fictional, generated illustration for the showcase portfolio.",
            "uploadedAt": "2025-06-01",
            "fileName": "demo-profile.png",
            "fileType": "image/png",
            "fileRef": PROFILE_REF,
        },
    }
    portfolio["program"] = {
        "id": "programming",
        "name": "Computer Programming (CMP)",
        "school": "ECTS",
        "website": "https://www.ects.org/programs/computer-programming/",
        "customNameEntered": True,
    }
    portfolio["aboutMe"] = {
        "careerGoal": "Data Scientist",
        "biography": "This fictional showcase demonstrates how a Computer Programming student might present projects, technical skills, and a career goal. Replace every demo entry with your own information before sharing.",
        "skills": [
            {"id": "demo-skill-python", "name": "Python"},
            {"id": "demo-skill-javascript", "name": "JavaScript"},
            {"id": "demo-skill-html", "name": "HTML"},
            {"id": "demo-skill-css", "name": "CSS"},
        ],
        "interests": ["Coding", "Data", "Designing useful tools"],
        "additionalInformation": None,
    }
    portfolio["hiringDocuments"] = {
        "coverLetter": {"id": "demo-cover-letter", "title": "Cover Letter", "description": None, "uploadedAt": None, "file": None},
        "resume": {"id": "demo-resume", "title": "Resume", "description": None, "uploadedAt": None, "file": None, "attachments": []},
        "standardApplication": {"id": "demo-application", "title": "Standard Application", "description": None, "uploadedAt": None, "file": None},
    }
    portfolio["workSamples"] = [
        {
            "id": "demo-work-climate-explorer",
            "title": "Climate Data Explorer (Demo)",
            "description": "A fictional project that reads a small data set, calculates monthly averages, and presents the results in a short report.",
            "date": "2025-10-14",
            "classOrProject": "Example programming project",
            "skills": ["Python", "CSV data", "Data summaries"],
            "file": demo_file(REPORT_REF, "climate-data-report.pdf", "application/pdf"),
            "link": None,
            "reflection": "Example reflection: organizing the input data first made the summary easier to check.",
            "notes": None,
        },
        {
            "id": "demo-work-portfolio-page",
            "title": "Portfolio Landing Page (Demo)",
            "description": "A fictional responsive page concept that organizes a short introduction, skills, and project links.",
            "date": "2025-09-18",
            "classOrProject": "Example programming project",
            "skills": ["HTML", "CSS", "JavaScript"],
            "file": None,
            "link": None,
            "reflection": "Example reflection: testing at a narrow screen width helped improve the layout.",
            "notes": None,
        },
        {
            "id": "demo-work-json-reporter",
            "title": "JSON Reporter (Demo)",
            "description": "A fictional Python exercise that reads values from JSON and prints a clear console summary.",
            "date": "2025-08-22",
            "classOrProject": "Example programming project",
            "skills": ["Python", "JSON"],
            "file": None,
            "link": None,
            "reflection": "Example reflection: checking for missing values made the output more reliable.",
            "notes": None,
        },
    ]
    portfolio["credentials"] = [
        {
            "id": "demo-credential-data-literacy",
            "name": "Data Literacy Badge (Demo Only)",
            "organization": "Example Learning Lab (fictional)",
            "date": "2025-06-16",
            "description": "Fictional sample entry to demonstrate how a credential can appear. This is not a real credential.",
            "file": None,
        }
    ]
    portfolio["accomplishments"] = {
        "awards": [
            {"id": "demo-award-showcase", "title": "Programming Showcase Recognition (Demo)", "organization": "Example Programming Course (fictional)", "date": "2025-05-20", "description": "Fictional sample award entry for the portfolio demonstration.", "file": None}
        ],
        "accomplishments": [
            {"id": "demo-achievement-attendance", "title": "Attendance Recognition (Demo)", "organization": "Example Program (fictional)", "date": "2025-04-30", "description": "Fictional sample entry showing a second achievement card.", "file": None}
        ],
        "extracurriculars": [],
        "serviceExperiences": [],
    }
    portfolio["recommendations"] = []
    portfolio["careerSafe"] = {"entries": []}
    portfolio["supportingAcademics"] = {
        "postSecondaryPlan": {"careerGoal": None, "educationGoal": None, "schools": [], "certifications": [], "plans": None, "additionalInformation": None},
        "growthReflection": None,
        "reflections": [],
        "potentialEmployers": [],
        "postSecondaryOpportunities": [],
        "homeSchoolReflection": None,
        "instructionalAssistant": {"name": "", "date": None},
        "instructor": {"name": "", "date": None},
        "documents": {},
    }
    portfolio["cewStandards"] = {}
    portfolio["settings"]["sectionOrder"] = [
        "aboutMe", "hiringDocuments", "workSamples", "credentials",
        "accomplishments", "recommendations", "careerSafe", "supportingAcademics",
    ]
    portfolio["settings"]["customSections"] = []
    portfolio["metadata"].update({
        "createdAt": "2025-06-01",
        "updatedAt": "2025-06-01",
        "lastExportedAt": None,
        "revision": 1,
        "description": "Fictional showcase data. Replace all demo entries before sharing.",
        "tags": ["demo", "showcase", "fictional"],
    })
    portfolio["assets"] = [
        {
            "id": PROFILE_REF,
            "fileRef": PROFILE_REF,
            "path": PROFILE_PATH,
            "fileName": "demo-profile.png",
            "mediaType": "image/png",
            "description": "Generated fictional demo avatar.",
            "tags": ["demo", "profile"],
            "sizeBytes": len(profile_bytes),
            "public": True,
        },
        {
            "id": REPORT_REF,
            "fileRef": REPORT_REF,
            "path": REPORT_PATH,
            "fileName": "climate-data-report.pdf",
            "mediaType": "application/pdf",
            "description": "Fictional example project report. Not real student work.",
            "tags": ["demo", "project"],
            "sizeBytes": len(report_bytes),
            "public": True,
        },
    ]

    portfolio_json = (json.dumps(portfolio, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    (HERE / "showcase.json").write_bytes(portfolio_json)
    manifest = {
        "format": "ects-portfolio",
        "version": 1,
        "portfolioFile": "portfolio.json",
        "files": [PROFILE_PATH, REPORT_PATH],
        "relationships": [
            {"fileRef": PROFILE_REF, "fileName": "demo-profile.png", "fileType": "image/png", "path": PROFILE_PATH},
            {"fileRef": REPORT_REF, "fileName": "climate-data-report.pdf", "fileType": "application/pdf", "path": REPORT_PATH},
        ],
    }
    archive_path = HERE / "showcase.ects-portfolio"
    with ZipFile(archive_path, "w", compression=ZIP_DEFLATED, compresslevel=8) as archive:
        entries = [
            ("manifest.json", (json.dumps(manifest, indent=2) + "\n").encode("utf-8")),
            ("portfolio.json", portfolio_json),
            (PROFILE_PATH, profile_bytes),
            (REPORT_PATH, report_bytes),
        ]
        for name, data in entries:
            info = ZipInfo(name, FIXED_ZIP_TIME)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=8)
    print(f"Created {archive_path}")


if __name__ == "__main__":
    main()
