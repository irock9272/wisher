-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "bought" BOOLEAN NOT NULL DEFAULT false,
    "boughtBy" TEXT,
    "revealDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
