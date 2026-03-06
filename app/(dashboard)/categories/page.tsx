import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoriesTable } from "@/components/categories/categories-table"
import { CategoryDialog } from "@/components/categories/category-dialog"

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <>
      <Header title="Categories" description="Organize your equipment by category" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {categories?.length || 0} categories
          </p>
          <CategoryDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CategoryDialog>
        </div>
        <CategoriesTable categories={categories || []} />
      </div>
    </>
  )
}
