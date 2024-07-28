-- CreateTable
CREATE TABLE "Purshase" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpo_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Purshase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "endDateTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purshase_gpo_id_key" ON "Purshase"("gpo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_reference_key" ON "Reference"("reference");
