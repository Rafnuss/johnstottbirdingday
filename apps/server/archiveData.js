const fs = require("fs/promises");
const path = require("path");

const ROOT_DIR = __dirname;
const ARCHIVE_ROOT = path.join(ROOT_DIR, "archive");
const FILES_TO_ARCHIVE = ["checklists.json", "user.json", "info.json", "log.txt"];

function timestampSlug(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}Z`;
}

function sanitizeLabel(label) {
  return label.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function ensureReadable(filePath) {
  await fs.access(filePath);
}

async function main() {
  const rawLabel = process.argv[2];
  const archiveLabel = rawLabel ? sanitizeLabel(rawLabel) : `snapshot-${timestampSlug()}`;

  if (!archiveLabel) {
    throw new Error("Archive label is empty after sanitization.");
  }

  const archiveDir = path.join(ARCHIVE_ROOT, archiveLabel);
  await fs.mkdir(archiveDir, { recursive: true });

  const copiedFiles = [];

  for (const filename of FILES_TO_ARCHIVE) {
    const sourcePath = path.join(ROOT_DIR, filename);
    const targetPath = path.join(archiveDir, filename);
    await ensureReadable(sourcePath);
    await fs.copyFile(sourcePath, targetPath);
    copiedFiles.push(filename);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    archiveLabel,
    files: copiedFiles,
  };

  await fs.writeFile(
    path.join(archiveDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`Archive created at ${archiveDir}`);
  console.log(`Copied: ${copiedFiles.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
