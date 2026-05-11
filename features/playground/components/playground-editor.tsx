"use client";
import React, { useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { TemplateFile } from "../lib/path-to-json";

import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "@/features/playground/lib/editor-config";

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
}

// This component wraps the Monaco Editor and handles configuring it for the active file
const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
}: PlaygroundEditorProps) => {
  // Refs to access the editor instance and monaco API directly
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Called when the Monaco Editor successfully mounts to the DOM
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Apply our custom theme and editor configuration settings
    configureMonaco(monaco);
    // Set the syntax highlighting language based on the current file
    updateEditorLanguage();
  };

  // Updates the language of the editor model based on the active file's extension
  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Determine the language (e.g., "javascript", "typescript", "css")
    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      // Apply the selected language to the editor model
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  // Whenever the active file changes, ensure the language updates to match
  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  return (
    <div className="h-full relative">
      {/* todo ( ai thinking...) */}

      <Editor
        height={"100%"}
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        // @ts-ignore
        options={defaultEditorOptions}
      />
    </div>
  );
};

export default PlaygroundEditor;
