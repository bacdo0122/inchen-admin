'use client';

import { useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/lib/types';
import { VideoEmbed, toVideoEmbedUrl } from './video-embed-extension';
import { ImageWithAlign, type ImageAlign } from './image-align-extension';

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-fg hover:bg-muted disabled:opacity-40',
        active && 'bg-brand-muted text-brand',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập đường dẫn liên kết', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as UploadResult | { message?: string };
      if (!res.ok || !('url' in data)) {
        throw new Error(('message' in data && data.message) || 'Upload thất bại');
      }
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không chèn được ảnh');
    }
  };

  const insertVideo = () => {
    const raw = window.prompt('Dán link video YouTube hoặc Vimeo');
    if (!raw) return;
    const embed = toVideoEmbedUrl(raw);
    if (!embed) {
      toast.error('Link video không hợp lệ. Chỉ hỗ trợ YouTube hoặc Vimeo.');
      return;
    }
    editor.chain().focus().setVideoEmbed({ src: embed }).run();
  };

  const setAlign = (align: ImageAlign) => {
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { align }).run();
    } else {
      editor.chain().focus().setTextAlign(align).run();
    }
  };

  const isAlignActive = (align: ImageAlign) => {
    if (editor.isActive('image')) {
      return (editor.getAttributes('image').align ?? 'left') === align;
    }
    return editor.isActive({ textAlign: align });
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
      <ToolbarButton label="Đậm" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        label="Tiêu đề 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Tiêu đề 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Danh sách" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Căn trái" onClick={() => setAlign('left')} active={isAlignActive('left')}>
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Căn giữa" onClick={() => setAlign('center')} active={isAlignActive('center')}>
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Căn phải" onClick={() => setAlign('right')} active={isAlignActive('right')}>
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Liên kết" onClick={setLink} active={editor.isActive('link')}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Chèn ảnh" onClick={() => fileRef.current?.click()}>
        <ImagePlus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Chèn video" onClick={insertVideo}>
        <Video className="h-4 w-4" />
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void insertImage(f);
          e.target.value = '';
        }}
      />
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton label="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết…',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageWithAlign,
      VideoEmbed,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap prose-admin min-h-[280px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return <div className="min-h-[320px] rounded-lg border bg-muted/30" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-panel focus-within:ring-2 focus-within:ring-brand">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
