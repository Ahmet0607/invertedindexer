"use client"

import { useState, useEffect } from "react"
import { X, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePWAInstall } from "@/hooks/use-pwa-install"

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setIsDismissed(true)
    }
  }

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed) return null

  // Don't show if not installable and not iOS
  if (!isInstallable && !isIOS) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-96 md:rounded-lg md:border">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Download className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Install EquipTrack</h3>
            <p className="text-sm text-muted-foreground">
              {isIOS
                ? "Add to your home screen for the best experience"
                : "Install our app for quick access and offline support"}
            </p>
            <div className="mt-3 flex gap-2">
              {isIOS ? (
                <Button
                  size="sm"
                  onClick={() => setShowIOSInstructions(true)}
                >
                  <Share className="mr-2 size-4" />
                  How to Install
                </Button>
              ) : (
                <Button size="sm" onClick={handleInstall}>
                  <Download className="mr-2 size-4" />
                  Install App
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={handleDismiss}
          >
            <X className="size-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Install on iOS</h3>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => setShowIOSInstructions(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  1
                </span>
                <span>
                  Tap the <Share className="inline size-4 mx-1" /> Share button
                  in Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  2
                </span>
                <span>Scroll down and tap "Add to Home Screen"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  3
                </span>
                <span>Tap "Add" in the top right corner</span>
              </li>
            </ol>
            <Button
              className="w-full mt-6"
              onClick={() => {
                setShowIOSInstructions(false)
                handleDismiss()
              }}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
