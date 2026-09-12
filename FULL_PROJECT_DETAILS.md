# 🌾 AgriTrust Community Credit Network — Complete Comprehensive Project Overview & Architecture Guide

---

## 📌 Executive Summary

**AgriTrust Community Credit Network** is an end-to-end, AI/ML-powered alternative credit scoring, risk evaluation, and community lending platform designed for agricultural micro-finance and rural banking.

### The Research & Industry Gap Solved:
1. **Lack of Alternative Data Credit Scoring**: Traditional banks rely heavily on formal credit bureau scores (CIBIL/Equifax) and physical land title deeds. Smallholder farmers with no formal credit history are routinely rejected.
2. **Dynamic Risk Assessment Deficit**: Creditworthiness changes dynamically with weather conditions, AGMARKNET mandi market prices, and crop growth stages. Traditional static credit models fail to continuously evaluate changing repayment risks.
3. **Lack of Community & Social Capital Credit**: Individual small farmers have limited collateral, but when pooled into **Joint Liability Groups (JLG)** backed by Farmer Producer Organizations (FPOs), community trust acts as a powerful guarantee.

---

## 🏗️ Core Platform Features & Modules

### 1. Alternative Credit Scoring Engine (`creditScoringEngine.js`)
- Evaluates multi-source parameters:
  - **Landholding & Ownership**: Verified acres, Khatuni land registry status, ownership type.
  - **Crop Yield & Financial Margins**: Projected gross income, estimated input costs, debt service coverage ratio (DSCR).
  - **Government Schemes (PM-KISAN)**: Verified Direct Benefit Transfer (DBT) installment count (e.g. 14–17 installments received).
  - **Satellite Health & Soil Quality (ICAR)**: Canopy reflectance index (NDVI), soil vigor rating.
  - **Market Prices (AGMARKNET & NHB)**: Mandi modal prices and regional crop yield benchmarks.
- **Credit Metrics**: Generates a score (300–900) or displays `"Not Calculated"` for brand-new farmers with zero data entry.

### 2. AI Continuous Repayment Risk Prediction (`repaymentRiskAI.js`)
- Continuously evaluates farmer risk in real-time:
  - **Repayment Risk Score**: 0 to 100 scale.
  - **Risk Category**: **LOW** (0–30), **MEDIUM** (31–65), **HIGH** (66–100).
  - **Next Installment Success Probability**: Calculated percentage (e.g. 85% success probability).
  - **Positive & Risk Driver Breakdown**: Explains exactly *why* risk is high or low (e.g. "✓ High DSCR margin", "⚠ Uninsured crop plot", "⚠ Mandi price volatility").

### 3. Community Joint Credit & JLG Group Engine (`groupCreditEngine.js`)
- Allows **3 to 10 farmers** to form a Joint Liability Group (JLG).
- **Group Trust Score**: Formulated using weighted average member scores ($60\%$) and the weakest member's score ($40\%$).
- **Group Loan Ceiling & Sub-Limits**: Calculates total group credit limit (with a 15% joint trust multiplier) and allocates individual member sub-limits based on landholding and credit standing.
- **Joint Liability Guarantee Drawdown**: In case of a member default, activates a configurable grace/resolution period (e.g., 30 days) and draws from the FPO Risk Reserve Guarantee Pool while adjusting the group's Trust Score.

### 4. Farmer History & Chronological Audit Logger (`auditLogger.js`, `farmerHistoryService.js`, `groupHistoryService.js`)
- Maintains an append-only, immutable **Audit Log** for every system action:
  - Timestamp, Event Type (`FARMER_REGISTERED`, `PROFILE_UPDATED`, `LOAN_APPLICATION_SUBMITTED`, `GROUP_CREATED`, `JOINT_LIABILITY_DEFAULT_TRIGGERED`), Previous Value, New Value, Performed By, Details.
- **Full History Views**: Clicking any farmer or group opens a detailed modal showing personal records, farm details, verification scores, loan history, repayment records, AI risk history, and complete audit logs.

### 5. Professional PDF Report Generator (`reportGenerator.js`)
- Generates downloadable, bank-ready PDF credit reports for individual farmers and JLG group credit profiles.

### 6. Strict Farmer Registration & Data Isolation
- Unique ID generation (`FARM-XX-XXXX`).
- Zero data bleed between users: Newly registered farmers start with a 100% clean profile (`0` loans, `0` defaults, `null` credit score, `1` audit log) without inheriting data from existing farmers.

---

## 👥 User Roles & Dashboards

1. **Farmer Portal (`FarmerVault.jsx`)**:
   - View credit profile, credit score badge, land size, crop info.
   - Edit Profile form with strict user data isolation.
   - Interactive Credit Simulator (simulate impact of crop change, land expansion, or peer endorsement).
   - Instant Loan Application modal.
   - ZK-Consent Passport & QR Code generator.
2. **FPO Chairman Portal (`FPOCommunityHub.jsx`)**:
   - Member endorsement & vouching network.
   - Joint Liability Group (JLG) creation, monitoring, and deletion.
   - Joint guarantee default drawdown simulator.
3. **Bank Credit Officer Portal (`BankCreditPortal.jsx`)**:
   - Underwriting queue for loan applications.
   - Multi-source ML verification scores (PM-KISAN + Satellite + NHB).
   - One-click loan sanction / rejection.
4. **Admin & Verification Portal (`AdminUsersAudit.jsx`)**:
   - Complete system database audit table of registered farmers, mobile login credentials, Aadhaar IDs, and risk ratings.

---

## 🛠️ Complete Technical Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | React 18 (Hooks, Functional Components) |
| **Build Tool & HMR** | Vite 6 |
| **Styling & UI Components** | Tailwind CSS 3.4 + Lucide React Icons |
| **Data Visualization** | Recharts (Responsive Line & Bar Charts) |
| **Backend Runtime** | Node.js (ES Modules) |
| **Web Server** | Express.js 4 |
| **Database & Storage** | PostgreSQL 16 (Primary) + High-Performance JSON Persistence Mode |
| **PDF Generation** | Native Client-Side Document Generator |

---

## 💻 API Endpoints Reference

### Authentication & Profiles
- `POST /api/auth/login` — Authenticate farmer by Mobile No or Farmer ID.
- `POST /api/auth/register-farmer` — Register new farmer account with clean initial state.
- `GET /api/credit-profile/:farmerId` — Fetch credit score & multi-source metrics.
- `PUT /api/farmer/update-profile` — Update farmer profile details.
- `DELETE /api/farmer/delete-account/:farmerId` — Delete farmer account.

### History & Audit Trail
- `GET /api/history/farmer/:farmerId` — Fetch complete farmer history & audit logs.
- `GET /api/history/group/:groupId` — Fetch complete group history & audit logs.
- `GET /api/history/audit-logs` — Fetch global system audit logs.

### Joint Credit (JLG)
- `GET /api/group-credit/list-groups` — Fetch all JLG groups.
- `POST /api/group-credit/calculate-score` — Calculate group score preview.
- `POST /api/group-credit/create-group` — Create new JLG group.
- `POST /api/group-credit/trigger-default` — Trigger joint liability guarantee drawdown.
- `DELETE /api/group-credit/delete-group/:groupId` — Delete JLG group.

### AI Risk Prediction
- `POST /api/ai/predict-repayment-risk` — Calculate AI repayment risk score & drivers.
- `GET /api/ai/repayment-risk-audit` — Fetch platform-wide repayment risk audit.

---

## 🚀 How to Run the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start backend server & frontend concurrently
npm start

# Server will run on: http://localhost:5000
# Frontend will run on: http://localhost:5173
```

---

## 📂 Key Files & Directories

- `src/App.jsx` — Primary application layout & tab navigation.
- `src/components/FarmerVault.jsx` — Farmer Vault dashboard & Edit Profile modal.
- `src/components/FPOCommunityHub.jsx` — FPO Hub & JLG group management.
- `src/components/BankCreditPortal.jsx` — Bank underwriting portal.
- `src/components/AdminUsersAudit.jsx` — Platform admin & verification audit.
- `src/components/FarmerHistoryModal.jsx` — Detailed farmer profile & audit trail modal.
- `src/components/GroupHistoryModal.jsx` — Detailed group history & audit trail modal.
- `server/index.js` — Express backend API routes.
- `server/services/creditScoringEngine.js` — Core credit scoring calculation logic.
- `server/services/repaymentRiskAI.js` — AI continuous repayment risk prediction engine.
- `server/services/groupCreditEngine.js` — JLG group credit & joint liability engine.
- `server/services/auditLogger.js` — Chronological audit trail logging service.
