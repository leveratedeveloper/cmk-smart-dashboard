import type { ConversationItem } from '../types';

export type Database = {
  public: {
    Tables: {
      chat_logs: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          title: string;
          conversation: ConversationItem[];
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          conversation: ConversationItem[];
        };
        Update: {
          id?: string;
          conversation?: ConversationItem[];
          user_id?: string;
          title?: string;
        };
      };
      campaign_staging: {
        Row: {
          Date: string;
          "Campaign Name": string;
          "Amount Spent": string;
          Reach: string | null;
          Impressions: string | null;
          "Post Engagements": string | null;
          Clicks: string | null;
          "Video Views": string | null;
          Follows: string | null;
          "Conversation Started": string | null;
          Leads: string | null;
          "Store Visits": string | null;
          "Content View": string | null;
          Purchases: string | null;
          "Total User": string | null;
          "Session GA4": string | null;
          Month: string | null;
          Week: string | null;
          Brand: string | null;
          Channel: string | null;
          Objective: string | null;
          Result: string | null;
          Funnels: string | null;
          Product: string | null;
        };
        Insert: {
          Date: string;
          "Campaign Name": string;
          "Amount Spent": string;
          Reach?: string | null;
          Impressions?: string | null;
          "Post Engagements"?: string | null;
          Clicks?: string | null;
          "Video Views"?: string | null;
          Follows?: string | null;
          "Conversation Started"?: string | null;
          Leads?: string | null;
          "Store Visits"?: string | null;
          "Content View"?: string | null;
          Purchases?: string | null;
          "Total User"?: string | null;
          "Session GA4"?: string | null;
          Month?: string | null;
          Week?: string | null;
          Brand?: string | null;
          Channel?: string | null;
          Objective?: string | null;
          Result?: string | null;
          Funnels?: string | null;
          Product?: string | null;
        };
        Update: {
          Date?: string;
          "Campaign Name"?: string;
          "Amount Spent"?: string;
          Reach?: string | null;
          Impressions?: string | null;
          "Post Engagements"?: string | null;
          Clicks?: string | null;
          "Video Views"?: string | null;
          Follows?: string | null;
          "Conversation Started"?: string | null;
          Leads?: string | null;
          "Store Visits"?: string | null;
          "Content View"?: string | null;
          Purchases?: string | null;
          "Total User"?: string | null;
          "Session GA4"?: string | null;
          Month?: string | null;
          Week?: string | null;
          Brand?: string | null;
          Channel?: string | null;
          Objective?: string | null;
          Result?: string | null;
          Funnels?: string | null;
          Product?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
