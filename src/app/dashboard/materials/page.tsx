'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { BookOpen, Download, FileArchive, FileImage, FileText, FileVideo, Music, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { useDataStore } from '@/store/data-store'
import { formatDate } from '@/lib/utils'

const ICON_FOR: Record<string, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-rose-500 bg-rose-500/10' },
  docx: { icon: FileText, color: 'text-sky-500 bg-sky-500/10' },
  doc: { icon: FileText, color: 'text-sky-500 bg-sky-500/10' },
  pptx: { icon: FileVideo, color: 'text-orange-500 bg-orange-500/10' },
  xlsx: { icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
  png: { icon: FileImage, color: 'text-violet-500 bg-violet-500/10' },
  jpg: { icon: FileImage, color: 'text-violet-500 bg-violet-500/10' },
  mp3: { icon: Music, color: 'text-fuchsia-500 bg-fuchsia-500/10' },
  zip: { icon: FileArchive, color: 'text-amber-500 bg-amber-500/10' },
}

export default function MaterialsPage() {
  const materials = useDataStore((s) => s.materials)
  const [subject, setSubject] = useState('all')
  const [query, setQuery] = useState('')

  const subjects = useMemo(() => Array.from(new Set(materials.map((m) => m.subject))).sort(), [materials])

  const list = useMemo(
    () =>
      materials.filter((m) => {
        const okSubject = subject === 'all' || m.subject === subject
        const q = query.trim().toLowerCase()
        const okQuery = !q || m.title.toLowerCase().includes(q) || (m.description ?? '').toLowerCase().includes(q)
        return okSubject && okQuery
      }),
    [materials, subject, query]
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Materi" description="Unduh materi pelajaran yang dibagikan guru dan wali kelas." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari materi..."
            className="pl-9"
            aria-label="Cari materi"
          />
        </div>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="sm:w-56" aria-label="Filter mata pelajaran">
            <SelectValue placeholder="Semua mapel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={BookOpen} title="Materi tidak ditemukan" description="Coba ubah kata kunci atau filter mata pelajaran." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m, i) => {
            const meta = ICON_FOR[m.file_type ?? 'pdf'] ?? ICON_FOR.pdf
            const Icon = meta.icon
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}>
                <Card glass className="flex h-full flex-col p-5 card-hover">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-semibold leading-snug">{m.title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[11px]">{m.subject}</Badge>
                        <Badge className="text-[11px] uppercase">{m.file_type}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{m.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Mengunduh "${m.title}"...`)}
                    >
                      <Download className="h-4 w-4" /> Unduh
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
