"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed or dismissed
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true
    setIsStandalone(isStandaloneMode)

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed")
    if (wasDismissed) {
      setDismissed(true)
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // For iOS, show banner immediately if not standalone and not dismissed
    if (isIOSDevice && !isStandaloneMode && !wasDismissed) {
      setShowBanner(true)
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!wasDismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowBanner(false)
        setDeferredPrompt(null)
      }
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem("pwa-banner-dismissed", "true")
  }

  if (isStandalone || dismissed || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Install EquipTracking</span>
            <span className="text-sm text-muted-foreground">
              {isIOS 
                ? "Tap Share then \"Add to Home Screen\"" 
                : "Get quick access from your home screen"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt && (
            <Button onClick={handleInstall} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
