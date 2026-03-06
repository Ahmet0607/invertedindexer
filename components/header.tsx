"use client"
// VERSION: 2024-03-05-FINAL-FIX-v5
// Uses plain HTML breadcrumbs - NO BreadcrumbSeparator component

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
      
      {/* Plain HTML breadcrumbs to avoid nested li hydration errors */}
      <nav aria-label="breadcrumb" className="flex items-center">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight 
                  className="size-3.5 hidden md:block text-muted-foreground" 
                  aria-hidden="true" 
                />
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
