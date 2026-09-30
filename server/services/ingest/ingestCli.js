import { runIngestion } from "./ingestionService.js";

async function main() {
  try {
    const startTime = Date.now();
    const result = await runIngestion();
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Ingest] Ingestion pipeline finished successfully in ${elapsedSec}s.`);
    console.log(`[Ingest] Summary:`, {
      files: result.filesProcessed,
      chunks: result.chunksCreated,
      cacheHits: result.cacheHits,
      newEmbeddings: result.newEmbeddings,
      upserted: result.upsertedCount
    });
    process.exit(0);
  } catch (err) {
    console.error(`[Ingest Error] Ingestion failed:`, err);
    process.exit(1);
  }
}

main();
