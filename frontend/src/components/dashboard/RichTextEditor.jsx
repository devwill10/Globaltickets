import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Strikethrough, Link as LinkIcon, Heading, Quote, Code, List, ListOrdered, IndentDecrease, IndentIncrease, Undo2, Redo2 } from 'lucide-react'

function Btn({ label, onClick, active, children }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={active} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded hover:bg-gray-200 ${active ? 'bg-gray-200 text-brand' : 'text-ink/80'}`}>
      {children}
    </button>
  )
}

// Output is HTML. ALWAYS sanitize it (DOMPurify) wherever it is displayed.
export default function RichTextEditor({ id, value, onChange, error }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } })],
    content: value || '',
    editorProps: { attributes: { id, class: 'rich-text min-h-[220px] px-4 py-3 text-sm outline-none', 'aria-label': 'Describe your event' } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  })
  if (!editor) return null
  const c = () => editor.chain().focus()

  function setLink() {
    const url = window.prompt('Link address (https://…)')
    if (!url) return
    try {
      const u = new URL(url)
      if (!['http:', 'https:', 'mailto:'].includes(u.protocol)) throw new Error()
      c().extendMarkRange('link').setLink({ href: u.href }).run()
    } catch { window.alert('Please enter a valid web address starting with https://') }
  }

  return (
    <div className={`overflow-hidden rounded-lg border bg-white focus-within:border-brand ${error ? 'border-red-500' : 'border-ink/20'}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 bg-gray-100 px-3 py-2">
        <Btn label="Bold" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn label="Italic" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn label="Strikethrough" active={editor.isActive('strike')} onClick={() => c().toggleStrike().run()}><Strikethrough size={16} /></Btn>
        <Btn label="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon size={16} /></Btn>
        <Btn label="Heading" active={editor.isActive('heading')} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading size={16} /></Btn>
        <Btn label="Quote" active={editor.isActive('blockquote')} onClick={() => c().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <Btn label="Code" active={editor.isActive('code')} onClick={() => c().toggleCode().run()}><Code size={16} /></Btn>
        <Btn label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()}><List size={16} /></Btn>
        <Btn label="Numbered list" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
        <Btn label="Outdent" onClick={() => c().liftListItem('listItem').run()}><IndentDecrease size={16} /></Btn>
        <Btn label="Indent" onClick={() => c().sinkListItem('listItem').run()}><IndentIncrease size={16} /></Btn>
        <span className="ml-auto flex gap-1">
          <Btn label="Undo" onClick={() => c().undo().run()}><Undo2 size={16} /></Btn>
          <Btn label="Redo" onClick={() => c().redo().run()}><Redo2 size={16} /></Btn>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
