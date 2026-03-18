'use client';

import { useEditor, EditorContent, Node, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Image, Link2, Upload,
  AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3,
  Undo, Redo, Loader2, Video,
} from 'lucide-react';

// ── Custom Tiptap Video Node ──────────────────────────────────────────────────
const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      autoplay: { default: false },
      muted: { default: true },
      loop: { default: false },
      style: { default: 'max-width:100%;border-radius:8px;' },
    };
  },

  parseHTML() {
    return [{ tag: 'video' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: true })];
  },
});

// ── Helper ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  bucket?: string;
  folder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, bucket = 'pages', folder = 'content' }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Upload image (max 5 MB)
  const uploadImageToStorage = useCallback(async (file: File | Blob): Promise<string | null> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('Ảnh phải nhỏ hơn 5MB'); return null; }
    setUploading(true);
    try {
      const ext = file instanceof File ? file.name.split('.').pop() : 'png';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, { cacheControl: '2592000', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      toast.success('Upload ảnh thành công!');
      return publicUrl;
    } catch (err) {
      console.error(err);
      toast.error('Upload ảnh thất bại');
      return null;
    } finally {
      setUploading(false);
    }
  }, [bucket, folder]);

  // Upload video (max 200 MB)
  const uploadVideoToStorage = useCallback(async (file: File): Promise<string | null> => {
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('Video phải nhỏ hơn 200MB'); return null; }
    setUploadingVideo(true);
    try {
      const ext = file.name.split('.').pop() ?? 'mp4';
      const fileName = `${folder}/video-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, { cacheControl: '2592000', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      toast.success('Upload video thành công!');
      return publicUrl;
    } catch (err) {
      console.error(err);
      toast.error('Upload video thất bại');
      return null;
    } finally {
      setUploadingVideo(false);
    }
  }, [bucket, folder]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: 'text-burgundy underline' } }),
      TiptapImage.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Nhập nội dung...' }),
      VideoNode,
    ],
    content,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    editorProps: {
      attributes: { class: 'prose-content min-h-[200px] p-4 focus:outline-none' },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImageToStorage(file).then((url) => {
                if (url && editor) editor.chain().focus().setImage({ src: url }).run();
              });
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const file = files[0];
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          uploadImageToStorage(file).then((url) => {
            if (url && editor) editor.chain().focus().setImage({ src: url }).run();
          });
          return true;
        }
        if (file.type.startsWith('video/')) {
          event.preventDefault();
          uploadVideoToStorage(file).then((url) => {
            if (url && editor) {
              editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
            }
          });
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh'); return; }
    const url = await uploadImageToStorage(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Video upload handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Vui lòng chọn file video'); return; }
    const url = await uploadVideoToStorage(file);
    if (url) editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Insert video by URL
  const addVideoByUrl = () => {
    const url = window.prompt('Nhập URL video (mp4, webm...):');
    if (url) editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
  };

  const addImageByUrl = () => {
    const url = window.prompt('Nhập URL ảnh:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt('Nhập URL liên kết:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const isUploadingAny = uploading || uploadingVideo;

  const ToolbarButton = ({
    onClick, isActive, children, title, disabled,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded hover:bg-secondary transition-colors ${
        isActive ? 'bg-secondary text-burgundy' : 'text-muted-foreground'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/mov" onChange={handleVideoUpload} className="hidden" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-secondary/30 border-b border-input">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading1 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Heading 4"><Heading3 className="w-4 h-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight className="w-4 h-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-4 h-4" /></ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={addLink} title="Thêm liên kết"><Link2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Upload ảnh" disabled={isUploadingAny}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </ToolbarButton>
        <ToolbarButton onClick={addImageByUrl} title="Thêm ảnh bằng URL"><Image className="w-4 h-4" /></ToolbarButton>

        {/* ── Video buttons ── */}
        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => videoInputRef.current?.click()} title="Upload video" disabled={isUploadingAny}>
          {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
        </ToolbarButton>
        <ToolbarButton onClick={addVideoByUrl} title="Thêm video bằng URL">
          <span className="text-[10px] font-bold leading-none">URL<br/>▶</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolbarButton>
      </div>

      {/* Upload indicator */}
      {(uploading || uploadingVideo) && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border-b border-gold/20 text-xs text-gold-dark">
          <Loader2 className="w-3 h-3 animate-spin" />
          {uploadingVideo ? 'Đang upload video (có thể mất vài giây)...' : 'Đang upload ảnh...'}
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hint */}
      <div className="px-3 py-1 bg-secondary/20 border-t border-input text-[10px] text-muted-foreground">
        💡 Paste ảnh (Ctrl+V) · Kéo thả ảnh/video · Nhấn <Video className="w-3 h-3 inline" /> để upload video
      </div>
    </div>
  );
}
