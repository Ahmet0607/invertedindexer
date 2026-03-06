import { createClient } from "@/lib/supabase/client"

export type ActionType = 
  | "added"
  | "updated"
  | "deleted"
  | "assigned"
  | "returned"
  | "invited"

export type EntityType = 
  | "equipment"
  | "employee"
  | "department"
  | "category"
  | "assignment"
  | "team_member"

export async function logActivity(
  action: ActionType,
  entityType: EntityType,
  entityName: string,
  entityId?: string,
  details?: Record<string, any>
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    entity_name: entityName,
    details: details || null
  })
}
