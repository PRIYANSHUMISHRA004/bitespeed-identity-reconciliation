import express from "express";
import { pool } from "./db.js";

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected ",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed " });
  }
});
app.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;
  // Input validation 
  if (!email && !phoneNumber) {
  return res.status(400).json({
    error: "At least one of email or phoneNumber must be provided",
  });
}

  try {
    // 1️ Find all contacts matching email OR phone
    const existing = await pool.query(
      `SELECT * FROM Contact
       WHERE email = $1 OR phoneNumber = $2`,
      [email || null, phoneNumber || null]
    );

    // 2️If no contact exists → create primary
    if (existing.rows.length === 0) {
      const newContact = await pool.query(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence)
         VALUES ($1, $2, 'primary')
         RETURNING *`,
        [email || null, phoneNumber || null]
      );

      const created = newContact.rows[0];

      return res.json({
        contact: {
          primaryContatctId: created.id,
          emails: created.email ? [created.email] : [],
          phoneNumbers: created.phonenumber ? [created.phonenumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // 3️ Collect all primary contacts among existing
    const primaryContacts = existing.rows.filter(
      (c: any) => c.linkprecedence === "primary"
    );

    let primary;

    if (primaryContacts.length > 1) {
      // Merge multiple primaries → oldest survives
      primaryContacts.sort(
        (a: any, b: any) =>
          new Date(a.createdat).getTime() -
          new Date(b.createdat).getTime()
      );

      primary = primaryContacts[0];

      for (let i = 1; i < primaryContacts.length; i++) {
        await pool.query(
          `UPDATE Contact
           SET linkedId = $1,
               linkPrecedence = 'secondary',
               updatedAt = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [primary.id, primaryContacts[i].id]
        );
      }
    } else if (primaryContacts.length === 1) {
      primary = primaryContacts[0];
    } else {
      // Edge case: all matches are secondary → resolve using oldest secondary
      const secondaryContacts = existing.rows;

      // Sort by createdAt (oldest first)
      secondaryContacts.sort(
        (a: any, b: any) =>
          new Date(a.createdat).getTime() -
          new Date(b.createdat).getTime()
      );

      const oldestSecondary = secondaryContacts[0];

      // Fetch its primary using linkedId
      const rootResult = await pool.query(
        `SELECT * FROM Contact WHERE id = $1`,
        [oldestSecondary.linkedid]
      );

      primary = rootResult.rows[0];
    }

    // 4️⃣ Check if exact email + phone combination already exists
    const exactExists = existing.rows.some(
      (c: any) => c.email === email && c.phonenumber === phoneNumber
    );

    // 5️⃣ If new information → create secondary linked to primary
    if (!exactExists) {
      await pool.query(
        `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
         VALUES ($1, $2, $3, 'secondary')`,
        [email || null, phoneNumber || null, primary.id]
      );
    }

    // 6️⃣ Fetch all contacts linked to the primary
    const allLinked = await pool.query(
      `SELECT * FROM Contact
       WHERE id = $1 OR linkedId = $1`,
      [primary.id]
    );

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryIds: number[] = [];

    allLinked.rows.forEach((c: any) => {
      if (c.email) emails.add(c.email);
      if (c.phonenumber) phoneNumbers.add(c.phonenumber);
      if (c.linkprecedence === "secondary") {
        secondaryIds.push(c.id);
      }
    });

    return res.json({
      contact: {
        primaryContactId: primary.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: secondaryIds,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});