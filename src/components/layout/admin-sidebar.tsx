'use client'

import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Database,
  FileBarChart,
  GraduationCap,
  Images,
  LayoutDashboard,
  Layout,
  Megaphone,
  MessageSquare,
  Network,
  Palette,
  Settings,
  Users,
} from 'lucide-react'
import { SidebarNav, type NavItem } from './sidebar-nav'

const items: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kelola Siswa', href: '/admin/students', icon: Users },
  { label: 'Kehadiran', href: '/admin/attendance', icon: CalendarCheck },
  { label: 'Tugas', href: '/admin/assignments', icon: ClipboardList },
  { label: 'Materi', href: '/admin/materials', icon: BookOpen },
  { label: 'Nilai', href: '/admin/grades', icon: GraduationCap },
  { label: 'Galeri', href: '/admin/gallery', icon: Images },
  { label: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
  { label: 'Kalender', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Organisasi', href: '/admin/organization', icon: Network },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Laporan', href: '/admin/reports', icon: FileBarChart },
  { label: 'Landing CMS', href: '/admin/landing', icon: Layout },
  { label: 'Theme & CSS', href: '/admin/theme', icon: Palette },
  { label: 'Database', href: '/admin/database', icon: Database },
  { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  return <SidebarNav items={items} variant="admin" title="X-5 SMAN 1 Pbg" subtitle="Admin Panel" />
}
