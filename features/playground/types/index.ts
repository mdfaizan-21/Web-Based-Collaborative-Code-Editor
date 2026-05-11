// Represents a single file with its content and extension
export interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}
export interface PlaygroundData {
  id: string;
  name?: string;
  [key: string]: any;
}

// Represents a folder which can contain files and other folders
export interface TemplateFolder {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

export interface LoadingStepProps {
  currentStep: number;
  step: number;
  label: string;
}

// Represents a file that is currently open in the editor workspace
export interface OpenFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  content: string;
  originalContent: string;
}
