"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Code, Image as ImageIcon, 
  Link as LinkIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Quote, Undo, Redo, Eraser, Type, Minus, CornerDownLeft, FileImage
} from 'lucide-react';
import { APITemplate } from './API/Template';
import { getImageUrl } from '@/utils/media';
import { useEffect } from 'react';

const lowlight = createLowlight(common);

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append("file", file);
      const result = await APITemplate("upload/image", "POST", data);
      
      if (result.success) {
        const fullUrl = getImageUrl(result.data.url);
        editor.chain().focus().setImage({ src: fullUrl }).run();
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="editor-menubar">
      <div className="menubar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
          title="Paragraph"
        >
          <Type size={18} />
        </button>
      </div>

      <div className="menubar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      <div className="menubar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div className="menubar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Code Block"
        >
          <Code size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Blockquote"
        >
          <Quote size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </button>
      </div>

      <div className="menubar-group">
        <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''} title="Link">
          <LinkIcon size={18} />
        </button>
        <button type="button" onClick={addImage} title="Image URL">
          <ImageIcon size={18} />
        </button>
        <label className="menubar-upload-btn" title="Upload Image">
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          <FileImage size={18} />
        </label>
      </div>

      <div className="menubar-group">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} title="Undo">
          <Undo size={18} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} title="Redo">
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};

const AdvancedEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[250px] p-4',
      },
    },
  });

  // Handle value updates from outside (e.g. when loading for edit)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="advanced-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .advanced-editor {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.2s;
        }
        .advanced-editor:focus-within {
          border-color: #6a00f5;
        }
        .editor-menubar {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f8fafc;
        }
        .menubar-group {
          display: flex;
          gap: 2px;
          padding-right: 6px;
          border-right: 1px solid #e2e8f0;
        }
        .menubar-group:last-child {
          border-right: none;
        }
        .editor-menubar button, .menubar-upload-btn {
          padding: 6px;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 6px;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .editor-menubar button:hover, .menubar-upload-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .editor-menubar button.is-active {
          background: #f3ebff;
          color: #6a00f5;
          border-color: #6a00f5;
        }
        .editor-menubar button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .ProseMirror {
          padding: 16px;
          min-height: 200px;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror pre {
          background: #1e293b;
          color: #f8fafc;
          font-family: 'JetBrainsMono', monospace;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .ProseMirror blockquote {
          padding-left: 1rem;
          border-left: 4px solid #e2e8f0;
          color: #64748b;
          font-style: italic;
          margin: 1rem 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
};

export default AdvancedEditor;
