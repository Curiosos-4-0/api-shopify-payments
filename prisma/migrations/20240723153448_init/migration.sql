-- CreateTable
CREATE TABLE "Purshase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpo_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "endDateTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Purshase_gpo_id_key" ON "Purshase"("gpo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_reference_key" ON "Reference"("reference");
