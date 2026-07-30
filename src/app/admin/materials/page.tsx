'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, FileUp, Paperclip, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/empty-state'
import { useAuthStore } from '@/store/auth-store'
import { nowIso, uid, useDataStore } from '@/store/data-store'
import { SUBJECTS } from '@/lib/demo-data'
import { formatBytes, formatDate, sanitizeText, validateFile } from '@/lib/utils'
import type { Material } from '@/types/database'

const EMPTY = { title: '', subject: SUBJECTS[0], description: '', file_type: 'pdf' }

export default function AdminMaterialsPage() {
  const profile = useAuthStore((s) => s.profile)
  const materials = useDataStore((s) => s.materials)
  const add = useDataStore((s) => s.add)
  const update = useDataStore((s) => s.update)
  const remove = useDataStore((s) => s.remove)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...materials]
      .filter((m) => !q || m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  }, [materials, query])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY)
    setFile(null)
    setOpen(true)
  }

  function openEdit(m: Material) {
    setEditing(m)
    setForm({ title: m.title, subject: m.subject, description: m.description ?? '', file_type: m.file_type ?? 'pdf' })
    setFile(null)
    setOpen(true)
  }

  function pickFile(f: File | null) {
    if (!f) return setFile(null)
    const err = validateFile(f)
    if (err) return toast.error(err)
    setFile(f)
    const ext = f.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    setForm((p) => ({ ...p, file_type: ext, title: p.title || f.name.replace(/\.[^.]+$/, '') }))
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 3) return toast.error('Judul materi minimal 3 karakter.')

    const payload = {
      title: sanitizeText(form.title, 150),
      subject: form.subject,
      description: sanitizeText(form.description, 500),
      file_type: form.file_type,
    }

    if (editing) {
      update('materials', editing.id, payload)
      toast.success('Materi diperbarui.')
    } else {
      add('materials', { id: uid(), file_url: file?.name ?? '#', uploaded_by: profile?.id ?? null, created_at: nowIso(), ...payload })
      toast.success('Materi berhasil diunggah.')
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Materi"
        description={`${materials.length} materi pembelajaran tersedia`}
        action={<Button variant="gradient" onClick={openAdd}><Plus className="h-4 w-4" /> Upload Materi</Button>}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari materi..." className="pl-9" aria-label="Cari materi" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Unggah materi pertama untuk siswa."
          action={<Button variant="gradient" onClick={openAdd}><Plus className="h-4 w-4" /> Upload Materi</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <Card key={m.id} glass className="flex h-full flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold leading-snug">{m.title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[11px]">{m.subject}</Badge>
                    <Badge className="text-[11px] uppercase">{m.file_type}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(m)} aria-label="Edit materi"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(m)} aria-label="Hapus materi" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{m.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Materi' : 'Upload Materi'}</DialogTitle>
            <DialogDescription>Materi akan langsung tersedia untuk diunduh siswa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>File Materi</Label>
                <input ref={fileRef} type="file" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <Paperclip className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => setFile(null)} aria-label="Hapus file"><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-7 transition-colors hover:border-primary/50 hover:bg-accent/30"
                  >
                    <FileUp className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Pilih file materi</span>
                    <span className="text-xs text-muted-foreground">PDF, DOC, PPT, XLS, gambar · maks 10 MB</span>
                  </button>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="m-title">Judul *</Label>
              <Input id="m-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={150} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="m-subject">Mata Pelajaran</Label>
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger id="m-subject"><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-type">Tipe File</Label>
                <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                  <SelectTrigger id="m-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pdf', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'mp3', 'zip'].map((t) => (
                      <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">Deskripsi</Label>
              <Textarea id="m-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" variant="gradient">{editing ? 'Simpan' : 'Upload'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Materi?</DialogTitle>
            <DialogDescription>&ldquo;{confirmDelete?.title}&rdquo; akan dihapus permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) remove('materials', confirmDelete.id)
                toast.success('Materi dihapus.')
                setConfirmDelete(null)
              }}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
