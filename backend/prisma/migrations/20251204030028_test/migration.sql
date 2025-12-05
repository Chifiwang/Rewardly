-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "birthday" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "expiresAt" DATETIME,
    "resetToken" TEXT,
    "role" TEXT NOT NULL,
    "password" TEXT,
    "page" INTEGER NOT NULL DEFAULT 1,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "avatarUrl" TEXT,
    "suspicious" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "minSpending" INTEGER,
    "rate" REAL,
    "points" INTEGER
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "spent" INTEGER,
    "earned" INTEGER,
    "amount" INTEGER,
    "redeemed" INTEGER,
    "sent" INTEGER,
    "remark" TEXT,
    "relatedId" INTEGER,
    "createdBy" TEXT NOT NULL,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "sender" TEXT,
    "recipient" TEXT,
    "processedBy" TEXT,
    "utorid" TEXT NOT NULL,
    CONSTRAINT "Transaction_utorid_fkey" FOREIGN KEY ("utorid") REFERENCES "User" ("utorid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "capacity" INTEGER,
    "pointsRemain" INTEGER,
    "pointsAwarded" INTEGER DEFAULT 0,
    "published" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "_UserPromotions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserPromotions_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserPromotions_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PromotionTransactions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PromotionTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PromotionTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_OrganizedEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_OrganizedEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OrganizedEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AttendingEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AttendingEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AttendingEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_utorid_key" ON "User"("utorid");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "_UserPromotions_AB_unique" ON "_UserPromotions"("A", "B");

-- CreateIndex
CREATE INDEX "_UserPromotions_B_index" ON "_UserPromotions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PromotionTransactions_AB_unique" ON "_PromotionTransactions"("A", "B");

-- CreateIndex
CREATE INDEX "_PromotionTransactions_B_index" ON "_PromotionTransactions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizedEvents_AB_unique" ON "_OrganizedEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizedEvents_B_index" ON "_OrganizedEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttendingEvents_AB_unique" ON "_AttendingEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_AttendingEvents_B_index" ON "_AttendingEvents"("B");
