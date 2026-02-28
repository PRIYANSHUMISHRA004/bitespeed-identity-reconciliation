🧩 BiteSpeed Identity Reconciliation API

🚀 Overview

This project implements an Identity Reconciliation Service using:
	•	Node.js
	•	TypeScript
	•	PostgreSQL
	•	Inspired by DSU (Disjoint Set Union) concept

The goal is to merge multiple contact entries that belong to the same user based on shared email or phoneNumber.

🧠 Core Idea (DSU Inspired)

This system is inspired by the DSU (Disjoint Set Union) data structure.

In DSU:
	•	Each node has a parent.
	•	We perform find() to locate root.
	•	We perform union() to merge sets.

    In this project:

    DSU Concept                    Database Equivalent
    parent[] array                 linkedId column
    root node                      primary contact
    union()                        UPDATE query
    find()                         SELECT query

    •	linkedId acts as the parent pointer.
	•	The oldest contact becomes the primary (root).
	•	Other linked contacts become secondary

🏗 Tech Stack
	•	Node.js – Backend runtime
	•	TypeScript – Type-safe development
	•	Express – API framework
	•	PostgreSQL – Relational database
	•	dotenv – Environment variable management


🗄 Database Schema
CREATE TABLE Contact (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    phoneNumber VARCHAR(20),
    linkedId INT,
    linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary','secondary')) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);
Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_contact_email
ON Contact(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_phone
ON Contact(phoneNumber)
WHERE phoneNumber IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_linkedId
ON Contact(linkedId)
WHERE linkedId IS NOT NULL;

🔗 API Endpoint

POST /identify

Request
 {
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
At least one field must be provided.
Response
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["a@gmail.com", "b@gmail.com"],
    "phoneNumbers": ["111", "222"],
    "secondaryContactIds": [2, 3]
  }
}
🔄 Reconciliation Logic
	1.	If no matching contact exists → create primary contact.
	2.	If matching contact(s) exist:
	•	Collect all primary contacts.
	•	If multiple primaries → merge them (oldest survives).
	•	If new information → create secondary contact.
	3.	Fetch all linked contacts.
	4.	Return consolidated identity response.
⚡ Time & Space Complexity

Let:
	•	N = total contacts
	•	m = size of identity cluster
  Time Complexity: O(log N + m log m)
   	•	log N → Indexed lookup in PostgreSQL
	•	m log m → Sorting cluster during merge
 Space Complexity:O(m)
     For in-memory cluster processing.

🛠 Local Setup

1️⃣ Install Dependencies 
 npm install
2️⃣ Setup Database
 CREATE DATABASE bitespeed;
\c bitespeed
Run schema: psql -U postgres -d bitespeed -f schema.sql

3️⃣ Add Environment Variables

Create .env file:
 DB_USER=postgres
DB_HOST=localhost
DB_NAME=bitespeed
DB_PASSWORD=your_password
DB_PORT=5432


4️⃣ Run Application
npm run build
npm start
Server runs at:http://localhost:3000

🧩 Design Decisions
	•	Used DSU-inspired design for identity merging.
	•	Used linkedId as parent pointer.
	•	Deterministic root selection using createdAt.
	•	Defensive checks for edge cases.
	•	Normalized emails to lowercase.
	•	Added database indexes for scalability.

🌍 Deployment

Live URL:(Add Render URL here)
 
👨‍💻 Author

Priyanshu Mishra
Backend Engineering Intern Candidate


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
CREATE TABLE Contact (
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

### 2️⃣ Setup Database

```sql
CREATE DATABASE bitespeed;
\c bitespeed
```

Run schema:

```bash
psql -U postgres -d bitespeed -f schema.sql
```

### 3️⃣ Add Environment Variables

Create a `.env` file:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=bitespeed
DB_PASSWORD=your_password
DB_PORT=5432
```

### 4️⃣ Run Application

```bash
npm run build
npm start
```

Server runs at:

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
(Add Render URL here)
```

---

## 👨‍💻 Author

**Priyanshu Mishra**  
Backend Engineering Intern Candidate