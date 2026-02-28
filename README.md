# 🧩 BiteSpeed Identity Reconciliation API

## 🚀 Overview

This project implements an **Identity Reconciliation Service** using:

- **Node.js**
- **TypeScript**
- **PostgreSQL**
- Inspired by **DSU (Disjoint Set Union)** concept

The goal is to merge multiple contact entries that belong to the same user based on shared **email** or **phoneNumber**.

---

## 🧠 Core Idea (DSU Inspired)

This system is inspired by the **DSU (Disjoint Set Union)** data structure.

In **DSU**:
- Each node has a parent.
- We perform `find()` to locate the root.
- We perform `union()` to merge sets.

### Mapping DSU to Database

| DSU Concept      | Database Equivalent |
|------------------|--------------------|
| `parent[]` array | `linkedId` column  |
| root node        | primary contact    |
| `union()`        | `UPDATE` query     |
| `find()`         | `SELECT` query     |

- `linkedId` acts as the parent pointer.
- The **oldest contact becomes the primary (root)**.
- Other linked contacts become **secondary**.

---

## 🏗 Tech Stack

- **Node.js** – Backend runtime
- **TypeScript** – Type-safe development
- **Express** – API framework
- **PostgreSQL** – Relational database
- **dotenv** – Environment variable management

---

## 🗄 Database Schema

```sql
CREATE TABLE IF NOT EXISTS Contact (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    phoneNumber VARCHAR(20),
    linkedId INT,
    linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary','secondary')) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);
```

### 📌 Indexes for Performance

```sql
CREATE INDEX IF NOT EXISTS idx_contact_email
ON Contact(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_phone
ON Contact(phoneNumber)
WHERE phoneNumber IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_linkedId
ON Contact(linkedId)
WHERE linkedId IS NOT NULL;
```

---

## 🔗 API Endpoint

### `POST /identify`

### 📥 Request Body

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

> At least one of `email` or `phoneNumber` must be provided.

---

### 📤 Response Format

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["a@gmail.com", "b@gmail.com"],
    "phoneNumbers": ["111", "222"],
    "secondaryContactIds": [2, 3]
  }
}
```

---

## 🔄 Reconciliation Logic

1. If no matching contact exists → create **primary contact**.
2. If matching contact(s) exist:
   - Collect all primary contacts.
   - If multiple primaries → merge them (oldest survives).
   - If new information → create secondary contact.
3. Fetch all linked contacts.
4. Return consolidated identity response.

---

## ⚡ Time & Space Complexity

Let:
- **N** = total contacts
- **m** = size of identity cluster

### ⏱ Time Complexity

```
O(log N + m log m)
```

- `log N` → Indexed lookup in PostgreSQL
- `m log m` → Sorting cluster during merge

### 🧠 Space Complexity

```
O(m)
```

For in-memory cluster processing.

---

## 🛠 Local Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Setup PostgreSQL Database

Open `psql` and run:

```sql
CREATE DATABASE bitespeed;
```

Then connect to the database:

```sql
\c bitespeed
```

---

### 3️⃣ Run Database Schema

Execute the schema file to create the required tables and indexes:

```bash
psql -U postgres -d bitespeed -f schema.sql
```

---

### 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bitespeed
```

> ⚠️ If your password contains special characters like `#` or `@`, make sure to URL-encode them (e.g., `#` → `%23`).

---

### 5️⃣ Run the Application

```bash
npm run build
npm start
```

Server will run at:

```
http://localhost:3000
```

---

## 🧩 Design Decisions

- Used **DSU-inspired design** for identity merging.
- Used `linkedId` as parent pointer.
- Deterministic root selection using `createdAt`.
- Defensive checks for edge cases.
- Normalized emails to lowercase.
- Added database indexes for scalability.

---

## 🌍 Deployment

Live URL:

```
https://bitespeed-identity-reconciliation-2bub.onrender.com
```

### 🔄 CI/CD

This project is deployed using Render’s automatic CI/CD pipeline. Every push to the `main` branch triggers a fresh build and deployment of the service.

### 🛢 Production Database

The PostgreSQL database is hosted on Render and configured securely using the `DATABASE_URL` environment variable.

---

## 👨‍💻 Author

**Priyanshu Mishra**  
Backend Engineering Intern Candidate

---

## 🤖 AI Assistance

This project was developed with the assistance of AI tools for:

- Code structuring guidance
- Architectural discussions (DSU-inspired modeling)
- Edge-case reasoning
- Documentation refinement

All core logic, implementation decisions, and understanding of the system were independently designed and implemented by the author.

The use of AI tools reflects familiarity with modern engineering workflows and productivity tools.