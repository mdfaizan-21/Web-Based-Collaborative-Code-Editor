"use client";

import { Sidebar, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import Editor, { OnMount } from "@monaco-editor/react";
import monaco from "monaco-editor";
import { useRef } from "react";
import SideBar from "./sidebar/sidebar";

export default function CodeEditor() {
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };
  return (
    <>
      <SideBar />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          maxSize={75}
          className="flex flex-col p-2"
        >
          <div className="h-10 w-full flex gap-2">
            <Button
              variant={"secondary"}
              size={"sm"}
              className="min-w-20 justify-between"
            >
              index.html
              <X className="w-3 h-3" />
            </Button>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="min-w-20 justify-between"
            >
              Style.css
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="grow  w-full overflow-hidden rounded-lg">
            <Editor
              height={"100%"}
              defaultLanguage="java"
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                minimap: {
                  enabled: false,
                },
                padding: {
                  bottom: 4,
                  top: 4,
                },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40} className="p-2">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} className="flex flex-col ">
              <div className="h-10 w-full flex gap-2">
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="min-w-20 justify-between"
                >
                  local-host:3000
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="w-full grow rounded-lg bg-foreground"></div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} className="flex flex-col p-2 ">
              <div className="h-10 w-full flex gap-2">
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="min-w-20 justify-between"
                >
                  Terminal
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="w-full grow rounded-lg bg-foreground"></div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
