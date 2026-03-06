"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone, Share, PlusSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSDialog, setShowIOSDialog] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
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

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)

    // For iOS, show banner immediately if not standalone and not dismissed
    if (isIOSDevice && !isStandaloneMode && !wasDismissed) {
      setShowBanner(true)
    }

    // For Android without beforeinstallprompt support, show banner
    if (isAndroidDevice && !isStandaloneMode && !wasDismissed) {
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
    if (isIOS) {
      setShowIOSDialog(true)
      return
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowBanner(false)
        setDeferredPrompt(null)
      }
    } else if (isAndroid) {
      // For Android browsers without beforeinstallprompt, show instructions
      setShowIOSDialog(true)
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
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:bottom-auto md:top-0 md:border-b md:border-t-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Install EquipTracking</span>
              <span className="text-sm text-muted-foreground">
                Get quick access from your home screen
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleInstall} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install EquipTracking</DialogTitle>
            <DialogDescription>
              Follow these steps to install the app on your device
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isIOS ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
                  <div className="flex-1">
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground">At the bottom of Safari (box with arrow pointing up)</p>
                    <Share className="mt-2 h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
                  <div className="flex-1">
                    <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground">You may need to scroll down to find it</p>
                    <PlusSquare className="mt-2 h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
                  <div className="flex-1">
                    <p className="font-medium">Tap the menu button</p>
                    <p className="text-sm text-muted-foreground">Three dots in the top-right corner of Chrome</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
                  <div className="flex-1">
                    <p className="font-medium">Tap "Add to Home screen"</p>
                    <p className="text-sm text-muted-foreground">Or "Install app" if available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
                  <div className="flex-1">
                    <p className="font-medium">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button onClick={() => setShowIOSDialog(false)} className="w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
