// Export utilities for CSV and PDF generation

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; header: string }[]
) {
  if (data.length === 0) return

  // Create CSV header
  const header = columns.map((col) => col.header).join(",")

  // Create CSV rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key]
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? "")
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(",")
  )

  // Combine header and rows
  const csv = [header, ...rows].join("\n")

  // Download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  title: string,
  columns: { key: keyof T; header: string }[]
) {
  // Create printable HTML
  const tableRows = data
    .map(
      (item) =>
        `<tr>${columns
          .map((col) => `<td style="border: 1px solid #ddd; padding: 8px;">${String(item[col.key] ?? "")}</td>`)
          .join("")}</tr>`
    )
    .join("")

  const tableHeaders = columns
    .map((col) => `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${col.header}</th>`)
    .join("")

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { text-align: left; }
        .meta { color: #666; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `

  // Open print window
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
