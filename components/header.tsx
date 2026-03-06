// Build version: 2024-SYNC-v3 - Plain HTML breadcrumbs, no BreadcrumbSeparator
"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  breadcrumbs: Array<{
    label: string
    href?: string
  }>
}

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <nav aria-label="breadcrumb" className="flex items-center">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="size-3.5 hidden md:block" aria-hidden="true" />
              )}
              {crumb.href ? (
                <Link 
                  href={crumb.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
