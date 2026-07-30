'use client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PWAInstallPrompt } from '@/components/shared/pwa-install-prompt'
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register'
import { CustomThemeInjector } from '@/components/shared/custom-theme-injector'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        <CustomThemeInjector />
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ classNames: { toast: 'rounded-xl border-border' } }}
        />
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
      </TooltipProvider>
    </ThemeProvider>
  )
}
