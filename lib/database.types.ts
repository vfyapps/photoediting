export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_prompts: {
        Row: {
          goal_code: string | null
          id: string
          notes_md: string | null
          prompt_text: string
          sort_order: number
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          goal_code?: string | null
          id?: string
          notes_md?: string | null
          prompt_text: string
          sort_order?: number
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          goal_code?: string | null
          id?: string
          notes_md?: string | null
          prompt_text?: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_prompts_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "editing_goals"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "academy_prompts_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "v_goal_usage"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "academy_prompts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_reads: {
        Row: {
          guideline_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          guideline_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          guideline_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_reads_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      ares_expert_aliases: {
        Row: {
          alias: string
          created_at: string
          rental_expert_id: string
        }
        Insert: {
          alias: string
          created_at?: string
          rental_expert_id: string
        }
        Update: {
          alias?: string
          created_at?: string
          rental_expert_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ares_expert_aliases_rental_expert_id_fkey"
            columns: ["rental_expert_id"]
            isOneToOne: false
            referencedRelation: "rental_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      ares_shoots: {
        Row: {
          acco_id: string
          ares_row_key: string
          expert_alias: string | null
          imported_at: string
          land: string
          photographer_alias: string | null
          postcode: string
          request_date: string | null
          status: string
          tasks: string[]
        }
        Insert: {
          acco_id: string
          ares_row_key: string
          expert_alias?: string | null
          imported_at?: string
          land: string
          photographer_alias?: string | null
          postcode: string
          request_date?: string | null
          status: string
          tasks?: string[]
        }
        Update: {
          acco_id?: string
          ares_row_key?: string
          expert_alias?: string | null
          imported_at?: string
          land?: string
          photographer_alias?: string | null
          postcode?: string
          request_date?: string | null
          status?: string
          tasks?: string[]
        }
        Relationships: []
      }
      assignments: {
        Row: {
          acco_id: string
          ares_row_key: string | null
          briefing: string | null
          cancel_reason: string | null
          created_at: string
          created_by: string | null
          date_assigned: string | null
          date_completed: string | null
          editor_id: string | null
          id: string
          import_goal_code: string | null
          legacy_notes: string | null
          magnific_url: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          rental_expert_id: string | null
          request_date: string | null
          source: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          acco_id: string
          ares_row_key?: string | null
          briefing?: string | null
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          date_assigned?: string | null
          date_completed?: string | null
          editor_id?: string | null
          id?: string
          import_goal_code?: string | null
          legacy_notes?: string | null
          magnific_url?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          rental_expert_id?: string | null
          request_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          acco_id?: string
          ares_row_key?: string | null
          briefing?: string | null
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          date_assigned?: string | null
          date_completed?: string | null
          editor_id?: string | null
          id?: string
          import_goal_code?: string | null
          legacy_notes?: string | null
          magnific_url?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          rental_expert_id?: string | null
          request_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "editors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_import_goal_code_fkey"
            columns: ["import_goal_code"]
            isOneToOne: false
            referencedRelation: "editing_goals"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "assignments_import_goal_code_fkey"
            columns: ["import_goal_code"]
            isOneToOne: false
            referencedRelation: "v_goal_usage"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "assignments_rental_expert_id_fkey"
            columns: ["rental_expert_id"]
            isOneToOne: false
            referencedRelation: "rental_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_items: {
        Row: {
          assignment_id: string
          created_at: string
          done: boolean
          done_at: string | null
          goal_code: string
          id: string
          is_hero: boolean
          photo_number: number
        }
        Insert: {
          assignment_id: string
          created_at?: string
          done?: boolean
          done_at?: string | null
          goal_code: string
          id?: string
          is_hero?: boolean
          photo_number: number
        }
        Update: {
          assignment_id?: string
          created_at?: string
          done?: boolean
          done_at?: string | null
          goal_code?: string
          id?: string
          is_hero?: boolean
          photo_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "edit_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_items_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "editing_goals"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "edit_items_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "v_goal_usage"
            referencedColumns: ["code"]
          },
        ]
      }
      editing_goals: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          is_active: boolean
          label_en: string
          label_nl: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          label_en: string
          label_nl: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          label_en?: string
          label_nl?: string
          sort_order?: number
        }
        Relationships: []
      }
      editors: {
        Row: {
          id: string
          is_active: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      guideline_examples: {
        Row: {
          caption: string | null
          guideline_id: string
          id: string
          is_good: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          caption?: string | null
          guideline_id: string
          id?: string
          is_good?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          caption?: string | null
          guideline_id?: string
          id?: string
          is_good?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "guideline_examples_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
        ]
      }
      guidelines: {
        Row: {
          body_md: string
          category: string
          goal_code: string | null
          id: string
          is_published: boolean
          origin: Database["public"]["Enums"]["guideline_origin"]
          qc_issue_code: string | null
          slug: string
          sort_order: number
          title: string
          track: Database["public"]["Enums"]["guideline_track"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_md: string
          category?: string
          goal_code?: string | null
          id?: string
          is_published?: boolean
          origin?: Database["public"]["Enums"]["guideline_origin"]
          qc_issue_code?: string | null
          slug: string
          sort_order?: number
          title: string
          track?: Database["public"]["Enums"]["guideline_track"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_md?: string
          category?: string
          goal_code?: string | null
          id?: string
          is_published?: boolean
          origin?: Database["public"]["Enums"]["guideline_origin"]
          qc_issue_code?: string | null
          slug?: string
          sort_order?: number
          title?: string
          track?: Database["public"]["Enums"]["guideline_track"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guidelines_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "editing_goals"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "guidelines_goal_code_fkey"
            columns: ["goal_code"]
            isOneToOne: false
            referencedRelation: "v_goal_usage"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "guidelines_qc_issue_code_fkey"
            columns: ["qc_issue_code"]
            isOneToOne: false
            referencedRelation: "qc_issue_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "guidelines_qc_issue_code_fkey"
            columns: ["qc_issue_code"]
            isOneToOne: false
            referencedRelation: "v_qc_issue_frequency"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "guidelines_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_runs: {
        Row: {
          created_at: string
          created_count: number
          file_name: string
          id: string
          imported_by: string | null
          skipped_count: number
        }
        Insert: {
          created_at?: string
          created_count?: number
          file_name: string
          id?: string
          imported_by?: string | null
          skipped_count?: number
        }
        Update: {
          created_at?: string
          created_count?: number
          file_name?: string
          id?: string
          imported_by?: string | null
          skipped_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_runs_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          ares_alias: string | null
          created_at: string
          id: string
          is_active: boolean
          land: string | null
          name: string
          postcode: string | null
        }
        Insert: {
          ares_alias?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          land?: string | null
          name: string
          postcode?: string | null
        }
        Update: {
          ares_alias?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          land?: string | null
          name?: string
          postcode?: string | null
        }
        Relationships: []
      }
      qc_findings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_resolved: boolean
          issue_code: string | null
          photo_number: number | null
          review_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          issue_code?: string | null
          photo_number?: number | null
          review_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          issue_code?: string | null
          photo_number?: number | null
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_findings_issue_code_fkey"
            columns: ["issue_code"]
            isOneToOne: false
            referencedRelation: "qc_issue_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "qc_findings_issue_code_fkey"
            columns: ["issue_code"]
            isOneToOne: false
            referencedRelation: "v_qc_issue_frequency"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "qc_findings_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "qc_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_issue_types: {
        Row: {
          code: string
          description: string | null
          is_active: boolean
          label_nl: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string | null
          is_active?: boolean
          label_nl: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string | null
          is_active?: boolean
          label_nl?: string
          sort_order?: number
        }
        Relationships: []
      }
      qc_reviews: {
        Row: {
          assignment_id: string
          created_at: string
          decision: Database["public"]["Enums"]["qc_decision"]
          id: string
          reviewer_id: string | null
          round: number
          summary: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          decision: Database["public"]["Enums"]["qc_decision"]
          id?: string
          reviewer_id?: string | null
          round?: number
          summary?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          decision?: Database["public"]["Enums"]["qc_decision"]
          id?: string
          reviewer_id?: string | null
          round?: number
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qc_reviews_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_reviews_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_experts: {
        Row: {
          country: string | null
          email: string | null
          id: string
          is_active: boolean
          is_team: boolean
          name: string
        }
        Insert: {
          country?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_team?: boolean
          name: string
        }
        Update: {
          country?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_team?: boolean
          name?: string
        }
        Relationships: []
      }
      status_events: {
        Row: {
          actor_id: string | null
          assignment_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["assignment_status"] | null
          id: string
          to_status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          actor_id?: string | null
          assignment_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["assignment_status"] | null
          id?: string
          to_status: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          actor_id?: string | null
          assignment_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["assignment_status"] | null
          id?: string
          to_status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "status_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_events_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "v_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_assignments: {
        Row: {
          acco_id: string | null
          briefing: string | null
          cancel_reason: string | null
          created_at: string | null
          date_assigned: string | null
          date_completed: string | null
          editor_name: string | null
          goals: string[] | null
          id: string | null
          import_goal_code: string | null
          last_decision: Database["public"]["Enums"]["qc_decision"] | null
          legacy_notes: string | null
          magnific_url: string | null
          photo_count: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          rental_expert_name: string | null
          request_date: string | null
          rounds: number | null
          source: string | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_import_goal_code_fkey"
            columns: ["import_goal_code"]
            isOneToOne: false
            referencedRelation: "editing_goals"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "assignments_import_goal_code_fkey"
            columns: ["import_goal_code"]
            isOneToOne: false
            referencedRelation: "v_goal_usage"
            referencedColumns: ["code"]
          },
        ]
      }
      v_cycle_time: {
        Row: {
          fase: Database["public"]["Enums"]["assignment_status"] | null
          gem_dagen: number | null
          overgangen: number | null
        }
        Relationships: []
      }
      v_dashboard_status: {
        Row: {
          aantal: number | null
          pct: number | null
          status: Database["public"]["Enums"]["assignment_status"] | null
        }
        Relationships: []
      }
      v_editor_performance: {
        Row: {
          approval_pct: number | null
          approved: number | null
          denied: number | null
          editor: string | null
          fotos: number | null
          gem_doorlooptijd_dagen: number | null
          in_process: number | null
          toegewezen: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_goal_usage: {
        Row: {
          code: string | null
          fotos: number | null
          label_nl: string | null
          opdrachten: number | null
        }
        Relationships: []
      }
      v_monthly_completed: {
        Row: {
          afgerond_fotos: number | null
          afgerond_woningen: number | null
          maand: string | null
        }
        Relationships: []
      }
      v_monthly_volume: {
        Row: {
          aangevraagd_fotos: number | null
          aangevraagd_woningen: number | null
          maand: string | null
        }
        Relationships: []
      }
      v_qc_issue_frequency: {
        Row: {
          aantal: number | null
          code: string | null
          editors: number | null
          label_nl: string | null
          opdrachten: number | null
        }
        Relationships: []
      }
      v_qc_issues_per_editor: {
        Row: {
          aantal: number | null
          editor: string | null
          fout: string | null
        }
        Relationships: []
      }
      v_savings: {
        Row: {
          approved_summer_to_winter: number | null
          total_summer_to_winter: number | null
        }
        Relationships: []
      }
      v_team_average: {
        Row: {
          approval_pct: number | null
          editors: number | null
          fotos: number | null
          gem_doorlooptijd_dagen: number | null
          toegewezen: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_coordinator: { Args: never; Returns: boolean }
      is_current_user_editor: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "coordinator" | "editor" | "viewer"
      assignment_status:
        | "backlog"
        | "new"
        | "in_process"
        | "qc"
        | "approved"
        | "denied"
        | "ai_rejected"
      guideline_origin: "manual" | "qc_suggested"
      guideline_track: "onboarding" | "goal" | "tips"
      priority_level: "low" | "medium" | "high"
      qc_decision: "approved" | "denied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordinator", "editor", "viewer"],
      assignment_status: [
        "backlog",
        "new",
        "in_process",
        "qc",
        "approved",
        "denied",
        "ai_rejected",
      ],
      guideline_origin: ["manual", "qc_suggested"],
      guideline_track: ["onboarding", "goal", "tips"],
      priority_level: ["low", "medium", "high"],
      qc_decision: ["approved", "denied"],
    },
  },
} as const
