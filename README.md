# PlateBijak

PlateBijak is a smart vehicle data validation and error detection system. It helps ensure accurate vehicle details by automatically extracting, validating and correcting inputs like plate number, make, model and engine capacity — reducing mistakes during car insurance applications.

---

## Track & Problem Statement
Track: Industry Collaboration [BJAK]

Problem Statement: Smart Vehicle Data Validation & Error Detection

Description:
When buying or renewing car insurance online, users often mistype or enter incorrect vehicle details (e.g., plate number, car model, year of manufacture).

The Problems:
- Delayed policy approval
- Higher fraud/claim dispute risk
- Invalid or rejected coverage

Our Solutions:
PlateBijak validates and corrects data in real-time:
- Typos Detection: Detects mistakes in plate number, make, model, year, engine capacity, and VIN.
- Auto-Correction: Suggests fixes or lets users “Fix Issue" with one click.
- Fraud Detection: Risk scoring + behavior tracking (e.g., repeated submissions, unusual VINs).
- Voice Input: Safer, faster hands-free data entry.
- Camera Scan: Extracts plate numbers from photos.
- Chatbot Assistant: Guides users through the process.
- Risk-Aware Submission: Validate button only enabled when risk is Allow or Review, blocked otherwise.

Demo Scenarios:
- Allow: Valid details → Success.
- Block: High-risk/fraudulent (fake VIN, repeated plate) → Submission disabled.
- Review: Suspicious but possible (rare model/engine) → Flagged for manual verification from admin.
- AI Chatbot and Camera functionalities to enhance user experience (UX).

Tech Stack:
- Frontend: React + TypeScript + TailwindCSS
- Inputs: Camera (OCR), Microphone (Voice via Google APIs + FFmpeg), Keyboard
- Backend: Node.js + Express + CORS
- Validation Engine: Custom rules (Levenshtein distance for typos, VIN check digit, fraud scoring)
- Extras: Debounced validation, “Fix All” corrections, audit trail, risk-aware submission control

---

## Submission Details

1. GitHub Repository: [https://github.com/jkl0vain/PlateBijak]
2. Video Presentation: [https://youtu.be/gDdC5I4MDd8]