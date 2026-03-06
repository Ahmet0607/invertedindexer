"use client"

import { useState, useEffect } from "react"
import { Download, Share, Smartphone, Monitor, Apple, Chrome } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePWAInstall } from "@/hooks/use-pwa-install"

export default function InstallPage() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType("ios")
    } else if (/android/.test(userAgent)) {
      setDeviceType("android")
    } else {
      setDeviceType("desktop")
    }
  }, [])

  const handleInstall = async () => {
    await promptInstall()
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Install App" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Install EquipTrack</h1>
          <p className="text-muted-foreground">
            Get the best experience by installing our app on your device
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <Download className="size-5" />
                App Installed
              </CardTitle>
              <CardDescription>
                EquipTrack is already installed on your device. You can access it from your home screen or app drawer.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* iOS Instructions */}
            <Card className={deviceType === "ios" ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="size-5" />
                    iPhone / iPad
                  </CardTitle>
                  {deviceType === "ios" && (
                    <Badge>Your Device</Badge>
                  )}
                </div>
                <CardDescription>
                  Install via Safari browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      1
                    </span>
                    <span>
                      Open this page in <strong>Safari</strong> browser
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      2
                    </span>
                    <span>
                      Tap the <Share className="inline size-4 mx-1" /> Share button at the bottom
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      4
                    </span>
                    <span>
                      Tap <strong>"Add"</strong> in the top right corner
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Android Instructions */}
            <Card className={deviceType === "android" ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="size-5" />
                    Android
                  </CardTitle>
                  {deviceType === "android" && (
                    <Badge>Your Device</Badge>
                  )}
                </div>
                <CardDescription>
                  Install via Chrome browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInstallable ? (
                  <Button onClick={handleInstall} className="w-full">
                    <Download className="mr-2 size-4" />
                    Install Now
                  </Button>
                ) : (
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        1
                      </span>
                      <span>
                        Open this page in <strong>Chrome</strong> browser
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        2
                      </span>
                      <span>
                        Tap the <strong>menu icon</strong> (three dots) in the top right
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        3
                      </span>
                      <span>
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                      </span>
                    </li>
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Desktop Instructions */}
            <Card className={deviceType === "desktop" ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="size-5" />
                    Desktop
                  </CardTitle>
                  {deviceType === "desktop" && (
                    <Badge>Your Device</Badge>
                  )}
                </div>
                <CardDescription>
                  Install via Chrome or Edge browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInstallable ? (
                  <Button onClick={handleInstall} className="w-full">
                    <Download className="mr-2 size-4" />
                    Install Now
                  </Button>
                ) : (
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        1
                      </span>
                      <span>
                        Open this page in <strong>Chrome</strong> or <strong>Edge</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        2
                      </span>
                      <span>
                        Look for the <Chrome className="inline size-4 mx-1" /> install icon in the address bar
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        3
                      </span>
                      <span>
                        Click <strong>"Install"</strong> when prompted
                      </span>
                    </li>
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle>Why Install?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="size-5" />
                </div>
                <h3 className="font-medium">Quick Access</h3>
                <p className="text-sm text-muted-foreground">
                  Launch directly from your home screen
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Download className="size-5" />
                </div>
                <h3 className="font-medium">Offline Support</h3>
                <p className="text-sm text-muted-foreground">
                  View cached data without internet
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Monitor className="size-5" />
                </div>
                <h3 className="font-medium">Full Screen</h3>
                <p className="text-sm text-muted-foreground">
                  No browser bars for more screen space
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Share className="size-5" />
                </div>
                <h3 className="font-medium">Native Feel</h3>
                <p className="text-sm text-muted-foreground">
                  Feels like a native mobile app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note about preview */}
        <p className="text-sm text-muted-foreground text-center">
          Note: The install feature works best when the app is deployed and accessed directly in a browser, not in an embedded preview.
        </p>
      </div>
    </>
  )
}
