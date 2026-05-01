import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import DOMPurify from "dompurify";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Type,
} from "lucide-react";
import { cn } from "../lib/utils";

type EditorMode = "markdown" | "rich";

interface ArticleEditorProps {
  disabled?: boolean;
  isUploadingImage?: boolean;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  value: string;
}

const markdownConverter = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  headingStyle: "atx",
});

function markdownToHtml(markdown: string) {
  const rendered = marked.parse(markdown || "", { async: false }) as string;
  return DOMPurify.sanitize(rendered);
}

function htmlToMarkdown(html: string) {
  return markdownConverter.turndown(html || "").trim();
}

function fileNameToAltText(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "image";
}

export function ArticleEditor({
  disabled = false,
  isUploadingImage = false,
  onChange,
  onUploadImage,
  value,
}: ArticleEditorProps) {
  const [mode, setMode] = useState<EditorMode>("markdown");
  const lastSyncedMarkdownRef = useRef(value);
  const modeRef = useRef<EditorMode>("markdown");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Image],
    content: markdownToHtml(value),
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "article-editor-rich min-h-[320px] rounded-b-xl bg-[#000000] px-4 py-4 text-[15px] leading-7 text-[#D7DADC] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (modeRef.current !== "rich") {
        return;
      }
      const nextMarkdown = htmlToMarkdown(editor.getHTML());
      lastSyncedMarkdownRef.current = nextMarkdown;
      onChange(nextMarkdown);
    },
  });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || value === lastSyncedMarkdownRef.current) {
      return;
    }

    editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
    lastSyncedMarkdownRef.current = value;
  }, [editor, value]);

  const handleModeChange = (nextMode: EditorMode) => {
    if (!editor) {
      setMode(nextMode);
      return;
    }

    if (nextMode === "rich") {
      editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
      lastSyncedMarkdownRef.current = value;
    } else {
      const nextMarkdown = htmlToMarkdown(editor.getHTML());
      lastSyncedMarkdownRef.current = nextMarkdown;
      onChange(nextMarkdown);
    }

    setMode(nextMode);
  };

  const handleMarkdownChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    lastSyncedMarkdownRef.current = nextValue;
    onChange(nextValue);
  };

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const imageUrl = await onUploadImage(file);
    const altText = fileNameToAltText(file.name);

    if (mode === "rich" && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run();
      return;
    }

    const textarea = textareaRef.current;
    const insertion = `\n![${altText}](${imageUrl})\n`;

    if (!textarea) {
      const nextValue = `${value}${value.endsWith("\n") || !value ? "" : "\n"}${insertion}`;
      lastSyncedMarkdownRef.current = nextValue;
      onChange(nextValue);
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextValue =
      value.slice(0, selectionStart) +
      insertion +
      value.slice(selectionEnd);

    lastSyncedMarkdownRef.current = nextValue;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = selectionStart + insertion.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#34444E] bg-[#0B1416]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#34444E] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploadingImage}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B2A31] px-4 py-2 text-sm font-semibold text-[#D7DADC] transition hover:bg-[#243841] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" />
            {isUploadingImage ? "Uploading..." : "Upload image"}
          </button>
          <span className="text-xs text-[#82959B]">
            Images are inserted directly into the article body.
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleSelectImage}
          />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#34444E] bg-[#111B1F] p-1">
          <button
            type="button"
            onClick={() => handleModeChange("markdown")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition",
              mode === "markdown"
                ? "bg-[#D7DADC] text-[#000000]"
                : "text-[#82959B] hover:text-[#D7DADC]",
            )}
          >
            Markdown
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("rich")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition",
              mode === "rich"
                ? "bg-[#D7DADC] text-[#000000]"
                : "text-[#82959B] hover:text-[#D7DADC]",
            )}
          >
            Rich text
          </button>
        </div>
      </div>

      {mode === "rich" && editor ? (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#34444E] px-4 py-3">
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              disabled={disabled}
              icon={Heading2}
              label="Heading"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              active={editor.isActive("paragraph")}
              disabled={disabled}
              icon={Type}
              label="Paragraph"
              onClick={() => editor.chain().focus().setParagraph().run()}
            />
            <ToolbarButton
              active={editor.isActive("bold")}
              disabled={disabled}
              icon={Bold}
              label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              active={editor.isActive("italic")}
              disabled={disabled}
              icon={Italic}
              label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              active={editor.isActive("bulletList")}
              disabled={disabled}
              icon={List}
              label="Bullet list"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              active={editor.isActive("orderedList")}
              disabled={disabled}
              icon={ListOrdered}
              label="Ordered list"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              active={editor.isActive("blockquote")}
              disabled={disabled}
              icon={Quote}
              label="Quote"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
          </div>
          <EditorContent editor={editor} />
        </>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleMarkdownChange}
          disabled={disabled}
          placeholder="Write your article in Markdown. Use the upload button to place images where you want them."
          className="min-h-[360px] w-full resize-y bg-[#000000] px-4 py-4 text-[15px] leading-7 text-[#D7DADC] outline-none placeholder:text-[#61747C] disabled:cursor-not-allowed disabled:opacity-70"
        />
      )}
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
        active
          ? "border-[#D7DADC] bg-[#D7DADC] text-[#000000]"
          : "border-[#34444E] bg-[#111B1F] text-[#D7DADC] hover:bg-[#1B2A31]",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
