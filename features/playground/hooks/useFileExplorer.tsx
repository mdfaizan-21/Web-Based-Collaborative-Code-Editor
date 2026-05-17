import { create } from "zustand";

import { toast } from "sonner";
import { TemplateFile, TemplateFolder } from "../types";
import { generateFileId, findFilePath } from "../lib";

interface OpenFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  content: string;
  originalContent: string;
}

/**
 * Zustand store to manage the state of the file explorer globally.
 * This includes managing open files, active file, editor content, and folder structure.
 */
interface FileExplorerState {
  playgroundId: string;
  templateData: TemplateFolder | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  editorContent: string;

  // Actions
  setPlaygroundId: (id: string) => void;
  setTemplateData: (data: TemplateFolder | null) => void;
  setEditorContent: (content: string) => void;
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFileId: (fileId: string | null) => void;
  openFile: (file: TemplateFile) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;
  saveFile: (
    fileId: string,
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  saveAllFiles: (
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleAddFile: (
    newFile: TemplateFile,
    parentPath: string,
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    instance: any,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleAddFolder: (
    newFolder: TemplateFolder,
    parentPath: string,
    instance: any,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleDeleteFile: (
    file: TemplateFile,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  updateFileContent: (fileId: string, content: string) => void;
}

// @ts-ignore
export const useFileExplorer = create<FileExplorerState>((set, get) => ({
  templateData: null,
  playgroundId: "",
  openFiles: [] satisfies OpenFile[],
  activeFileId: null,
  editorContent: "",

  setTemplateData: (data) => set({ templateData: data }),
  setPlaygroundId(id) {
    set({ playgroundId: id });
  },
  setEditorContent: (content) => set({ editorContent: content }),
  setOpenFiles: (files) => set({ openFiles: files }),
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),

  // Opens a file in the editor, optionally switching to it if it's already open
  openFile: (file) => {
    const fileId = generateFileId(file, get().templateData!);
    const { openFiles } = get();
    const existingFile = openFiles.find((f) => f.id === fileId);

    if (existingFile) {
      set({ activeFileId: fileId, editorContent: existingFile.content });
      return;
    }

    const newOpenFile: OpenFile = {
      ...file,
      id: fileId,
      hasUnsavedChanges: false,
      content: file.content || "",
      originalContent: file.content || "",
    };

    set((state) => ({
      openFiles: [...state.openFiles, newOpenFile],
      activeFileId: fileId,
      editorContent: file.content || "",
    }));
  },

  // Closes an open file and determines which file should be active next
  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const newFiles = openFiles.filter((f) => f.id !== fileId);

    // If we're closing the active file, switch to another file or clear active
    let newActiveFileId = activeFileId;
    let newEditorContent = get().editorContent;

    if (activeFileId === fileId) {
      if (newFiles.length > 0) {
        // Switch to the last file in the list
        const lastFile = newFiles[newFiles.length - 1];
        newActiveFileId = lastFile.id;
        newEditorContent = lastFile.content;
      } else {
        // No files left
        newActiveFileId = null;
        newEditorContent = "";
      }
    }
    set({
      openFiles: newFiles,
      activeFileId: newActiveFileId,
      editorContent: newEditorContent,
    });
  },

  closeAllFiles: () => {
    set({
      openFiles: [],
      activeFileId: null,
      editorContent: "",
    });
  },

  saveFile: async (fileId, writeFileSync, saveTemplateData) => {
    const { openFiles, templateData } = get();
    const file = openFiles.find((f) => f.id === fileId);
    if (!file || !templateData) return;

    try {
      const filePath = findFilePath(file, templateData);
      if (!filePath) throw new Error("File path not found in template data");

      // 1. Write to WebContainer
      await writeFileSync(filePath, file.content);

      // 2. Update templateData
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const updateFileInFolder = (folder: TemplateFolder) => {
        for (let i = 0; i < folder.items.length; i++) {
          const item = folder.items[i];
          if ("folderName" in item) {
            updateFileInFolder(item as TemplateFolder);
          } else if (
            "filename" in item &&
            item.filename === file.filename &&
            item.fileExtension === file.fileExtension
          ) {
            item.content = file.content;
          }
        }
      };

      updateFileInFolder(updatedTemplateData);

      // 3. Save to backend
      await saveTemplateData(updatedTemplateData);

      // 4. Update state
      const updatedOpenFiles = [...openFiles];
      const index = updatedOpenFiles.findIndex((f) => f.id === fileId);
      if (index !== -1) {
        updatedOpenFiles[index] = {
          ...file,
          hasUnsavedChanges: false,
          originalContent: file.content,
        };
      }

      set({
        templateData: updatedTemplateData,
        openFiles: updatedOpenFiles,
      });

      toast.success(`Saved file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    }
  },

  saveAllFiles: async (writeFileSync, saveTemplateData) => {
    const { openFiles, templateData } = get();
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0 || !templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      for (const file of unsavedFiles) {
        const filePath = findFilePath(file, templateData);
        if (filePath) {
          // 1. Write to WebContainer
          await writeFileSync(filePath, file.content);

          // 2. Update templateData
          const updateFileInFolder = (folder: TemplateFolder) => {
            for (let i = 0; i < folder.items.length; i++) {
              const item = folder.items[i];
              if ("folderName" in item) {
                updateFileInFolder(item as TemplateFolder);
              } else if (
                "filename" in item &&
                item.filename === file.filename &&
                item.fileExtension === file.fileExtension
              ) {
                item.content = file.content;
              }
            }
          };

          updateFileInFolder(updatedTemplateData);
        }
      }

      // 3. Save to backend
      await saveTemplateData(updatedTemplateData);

      // 4. Update state
      const updatedOpenFiles = openFiles.map((file) => ({
        ...file,
        hasUnsavedChanges: false,
        originalContent: file.content,
      }));

      set({
        templateData: updatedTemplateData,
        openFiles: updatedOpenFiles,
      });

      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      console.error("Error saving all files:", error);
      toast.error("Failed to save all files");
    }
  },

  handleAddFolder: async (
    newFolder,
    parentPath,
    instance,
    saveTemplateData,
  ) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part,
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items.push(newFolder);
      set({ templateData: updatedTemplateData });
      toast.success(`Created folder: ${newFolder.folderName}`);

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);

      //   // Sync with web container
      //   if (instance && instance.fs) {
      //     const folderPath = parentPath
      //       ? `${parentPath}/${newFolder.folderName}`
      //       : newFolder.folderName;
      //     await instance.fs.mkdir(folderPath, { recursive: true });
      //   }
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  },

  handleDeleteFile: async (file, parentPath, saveTemplateData) => {
    const { templateData, openFiles } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part,
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("filename" in item) ||
          item.filename !== file.filename ||
          item.fileExtension !== file.fileExtension,
      );

      // Find and close the file if it's open
      // Use the same ID generation logic as in openFile
      const fileId = generateFileId(file, templateData);
      const openFile = openFiles.find((f) => f.id === fileId);

      if (openFile) {
        // Close the file using the closeFile method
        get().closeFile(fileId);
      }

      set({ templateData: updatedTemplateData });

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  },

  handleDeleteFolder: async (folder, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part,
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("folderName" in item) || item.folderName !== folder.folderName,
      );

      // Close all files in the deleted folder recursively
      const closeFilesInFolder = (
        folder: TemplateFolder,
        currentPath: string = "",
      ) => {
        folder.items.forEach((item) => {
          if ("filename" in item) {
            // Generate the correct file ID using the same logic as openFile
            const fileId = generateFileId(item, templateData);
            get().closeFile(fileId);
          } else if ("folderName" in item) {
            const newPath = currentPath
              ? `${currentPath}/${item.folderName}`
              : item.folderName;
            closeFilesInFolder(item, newPath);
          }
        });
      };

      closeFilesInFolder(
        folder,
        parentPath ? `${parentPath}/${folder.folderName}` : folder.folderName,
      );

      set({ templateData: updatedTemplateData });

      // Use the passed saveTemplateData function
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted folder: ${folder.folderName}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  },

  handleRenameFile: async (
    file,
    newFilename,
    newExtension,
    parentPath,
    saveTemplateData,
  ) => {
    const { templateData, openFiles, activeFileId } = get();
    if (!templateData) return;

    // Generate old and new file IDs using the same logic as openFile
    const oldFileId = generateFileId(file, templateData);
    const newFile = {
      ...file,
      filename: newFilename,
      fileExtension: newExtension,
    };
    const newFileId = generateFileId(newFile, templateData);

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part,
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const fileIndex = currentFolder.items.findIndex(
        (item) =>
          "filename" in item &&
          item.filename === file.filename &&
          item.fileExtension === file.fileExtension,
      );

      if (fileIndex !== -1) {
        const updatedFile = {
          ...currentFolder.items[fileIndex],
          filename: newFilename,
          fileExtension: newExtension,
        } as TemplateFile;
        currentFolder.items[fileIndex] = updatedFile;

        // Update open files with new ID and names
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === oldFileId
            ? {
                ...f,
                id: newFileId,
                filename: newFilename,
                fileExtension: newExtension,
              }
            : f,
        );

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          activeFileId: activeFileId === oldFileId ? newFileId : activeFileId,
        });

        // Use the passed saveTemplateData function
        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  },

  handleRenameFolder: async (
    folder,
    newFolderName,
    parentPath,
    saveTemplateData,
  ) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part,
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const folderIndex = currentFolder.items.findIndex(
        (item) => "folderName" in item && item.folderName === folder.folderName,
      );

      if (folderIndex !== -1) {
        const updatedFolder = {
          ...currentFolder.items[folderIndex],
          folderName: newFolderName,
        } as TemplateFolder;
        currentFolder.items[folderIndex] = updatedFolder;

        set({ templateData: updatedTemplateData });

        // Use the passed saveTemplateData function
        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed folder to: ${newFolderName}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  },

  // Updates the content of an open file (e.g. as the user types)
  updateFileContent: (fileId, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              content,
              hasUnsavedChanges: content !== file.originalContent,
            }
          : file,
      ),
      editorContent:
        fileId === state.activeFileId ? content : state.editorContent,
    }));
  },
}));
