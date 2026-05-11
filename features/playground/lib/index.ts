import { TemplateFile, TemplateFolder } from "./path-to-json";

/**
 * Recursively searches a folder structure to find the full path of a given file.
 * Returns the path string (e.g., "src/components/Button.tsx") or null if not found.
 */
export function findFilePath(
  file: TemplateFile,
  folder: TemplateFolder,
  pathSoFar: string[] = [],
): string | null {
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
      if (res) return res;
    } else {
      if (
        item.filename === file.filename &&
        item.fileExtension === file.fileExtension
      ) {
        return [
          ...pathSoFar,
          item.filename + (item.fileExtension ? "." + item.fileExtension : ""),
        ].join("/");
      }
    }
  }
  return null;
}

/**
 * Generates a unique string identifier for a file by combining its path,
 * filename, and extension. This is used as a unique key for open files.
 */
export const generateFileId = (
  file: TemplateFile,
  rootFolder: TemplateFolder,
): string => {
  // Find the file's path in the folder structure
  const path = findFilePath(file, rootFolder)?.replace(/^\/+/, "") || "";

  // Handle empty/undefined file extension
  const extension = file.fileExtension?.trim();
  const extensionSuffix = extension ? `.${extension}` : "";

  // Combine path and filename
  return path
    ? `${path}/${file.filename}${extensionSuffix}`
    : `${file.filename}${extensionSuffix}`;
};
