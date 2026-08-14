import { inflateRawSync } from "node:zlib";

/**
 * Minimal, dependency-free ZIP reader (STORED + DEFLATE only, no
 * encryption/spanning) — just enough to read the single-file GeoNames
 * postcode archives without a PowerShell/unzip-binary dependency, so the
 * generation script works the same on any machine.
 */
export function readZipEntries(buffer) {
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === eocdSignature) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error("Geen ZIP end-of-central-directory record gevonden.");

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let centralDirOffset = buffer.readUInt32LE(eocdOffset + 16);

  const entries = [];
  for (let i = 0; i < entryCount; i++) {
    const signature = buffer.readUInt32LE(centralDirOffset);
    if (signature !== 0x02014b50) throw new Error("Ongeldige ZIP central-directory entry.");

    const compressionMethod = buffer.readUInt16LE(centralDirOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralDirOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralDirOffset + 28);
    const extraFieldLength = buffer.readUInt16LE(centralDirOffset + 30);
    const commentLength = buffer.readUInt16LE(centralDirOffset + 32);
    const localHeaderOffset = buffer.readUInt32LE(centralDirOffset + 42);
    const fileName = buffer.toString("utf-8", centralDirOffset + 46, centralDirOffset + 46 + fileNameLength);

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraFieldLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

    const data = compressionMethod === 0 ? compressedData : inflateRawSync(compressedData);
    entries.push({ fileName, data });

    centralDirOffset += 46 + fileNameLength + extraFieldLength + commentLength;
  }
  return entries;
}
