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
-- Index for fast email lookup (ignore NULL values)
CREATE INDEX IF NOT EXISTS idx_contact_email
ON Contact(email)
WHERE email IS NOT NULL;

-- Index for fast phone lookup (ignore NULL values)
CREATE INDEX IF NOT EXISTS idx_contact_phone
ON Contact(phoneNumber)
WHERE phoneNumber IS NOT NULL;

-- Index for fast linkedId lookup (used during reconciliation)
CREATE INDEX IF NOT EXISTS idx_contact_linkedId
ON Contact(linkedId)
WHERE linkedId IS NOT NULL;