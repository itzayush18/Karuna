-- CreateTable
CREATE TABLE "InsightReferenceDataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'needs-assessment-reference-dataset',
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "sourceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageBucket" TEXT,
    "storagePath" TEXT,
    "publicUrl" TEXT,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "summary" TEXT,
    "metadata" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsightReferenceDataset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsightReferenceDataset_processingStatus_createdAt_idx" ON "InsightReferenceDataset"("processingStatus", "createdAt");
