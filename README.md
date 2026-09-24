# 🚘 Autohaus Frisch — Werkstatt Operations Copilot
> **DaiL Hackathon Sprint (Octopus Day — Sept 17, 2026)**  
> An AI-powered decision support platform built for German dealership workshop managers (*Werkstattmeister*) to detect, classify, and resolve shop floor bottlenecks between DMS and ERP systems.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_Corporate_Slate-38B2AC)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)

---

## 📌 Executive Overview

In automotive dealership management (e.g., **Autohaus Frisch Gruppe**), vehicles frequently experience artificial delays moving through physical service zones. A major driver of idle shop floor time is the disconnect between:
1. **DMS (Dealer Management System):** Tracks vehicle repair orders, labor, and technician job stages.
2. **ERP (Enterprise Resource Planning):** Tracks warehouse stock, OEM spare parts deliveries, and accounting.

When a physical part arrives at 08:30 AM in ERP, but the DMS job status remains stuck at *"Awaiting Parts"* due to manual administrative lag, workshop throughput drops. 

**Werkstatt Operations Copilot** bridges DMS and ERP streams in real-time, using Google Gemini to cross-reference timestamps, cite source evidence, and provide a **Human-in-the-Loop decision gate** for stage transitions.

---

## 🏗️ Architecture & Tech Stack
[ Next.js Frontend ]  <--->  [ Cloudflare Tunnel ]  <--->  [ FastAPI Agent Engine ]
(Vercel Production)                                       (Gemini + Supabase)
- **Frontend (`c02-ui`):** Next.js 14, React, Tailwind CSS (`slate-100` / `slate-900` corporate OEM aesthetic), Lucide Icons.
- **Backend (`c02-agent`):** FastAPI Python service powering AI diagnosis and endpoint execution.
- **AI Engine:** Google Gemini API for natural language cross-system dependency analysis.
- **Database & Audit:** Supabase (PostgreSQL) for persistence of status updates, source record citations, and user sign-offs.
- **Tunneling:** Cloudflare Tunnels (`cloudflared`) routing production frontend calls to the local agent server.

---

## 🏭 Physical Workshop Pipeline (4 Rooms)

The platform models the physical manufacture layout into four distinct operational zones:

| Zone | Stage Name | German Term | Description & AI Role |
| :--- | :--- | :--- | :--- |
| **Room 01** | Parts Depot | *Teilelager* | **Job `W-1` (Awaiting Parts):** AI cross-references ERP delivery timestamps vs. DMS status logs. High confidence triggers a 1-click stage advance. |
| **Room 02** | Repair Bay | *Werkstatt-Bucht* | **Job `W-2` (Repair Paused):** Identifies physical holds (e.g., pending customer approval for extra brake wear). |
| **Room 03** | Quality Control | *Endkontrolle* | **Job `W-3` (Quality Check):** **High Uncertainty Safety Gate.** Refuses automated overrides when road-test sign-offs are missing, forcing physical shop floor verification (*تحقق ميداني*). |
| **Room 04** | Delivery Desk | *Abgabe* | **Job `W-4` (Ready for Pickup):** Verified and cleared for customer handover with full audit history. |

---

## 🔬 Core Capabilities

### 1. Two-State Root Cause Classification
- **`MISSING_SYSTEM_UPDATE` (*تأخير إداري بالنظام*):** Pure administrative lag where physical tasks or parts are complete, but software status is unassigned.
- **`TRUE_BOTTLENECK` (*اختناق حقيقي*):** A genuine physical dependency hold (e.g., backordered hardware or pending client authorization).

### 2. Confidence-Based Safety Guardrails
- **High Confidence (85%–95%):** System provides 1-click approval to clear administrative lag immediately.
- **High Uncertainty / Low Confidence (<65%):** System refuses automated stage overrides (especially in safety-critical zones like *Endkontrolle*), requiring manager sign-off.

### 3. Full Audit Traceability
Every AI diagnosis cites exact source record IDs (`R-1`, `E-2`) from system logs and persists manager decisions to Supabase.

---

## 🛠️ API Endpoints

### Analyze Job Stage
```http
POST /api/analyze/{job_id}
