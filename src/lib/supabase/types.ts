import type { Role } from "@/data/roles";

// Database AppRole extends frontend Role to support full administrative hierarchy:
// Administrator (full control) -> Admin (appoints Captains) -> Captain (appoints Core) -> Core -> Member -> Student -> Participant
export type AppRole = "administrator" | Role | "captain";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "archived";

export type EventStatus = "draft" | "scheduled" | "published" | "cancelled" | "completed";

export type EventCategory = "workshop" | "hackathon" | "talk" | "competition" | "community";

export type PostStatus = "draft" | "scheduled" | "published" | "archived";

// Hand-written for now; can be replaced by generated types later.

export interface UserRoleRow {
  user_id: string;
  role: AppRole;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  registration_number: string | null;
  university: string | null;
  programme: string | null;
  department: string | null;
  study_year: string | null;
  semester: string | null;
  date_of_birth: string | null;
  graduation_year: number | null;
  interests: string[];
  skills: string[];
  headline: string | null;
  bio: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  avatar_path: string | null;
  cover_path: string | null;
  gender?: string | null;
  is_public_profile?: boolean;
  public_title?: string | null;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRow {
  id: string;
  user_id: string;
  status: RegistrationStatus;
  requested_role: AppRole;
  admin_note: string | null;
  applied_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  updated_at: string;
}

export interface RegistrationNoteRow {
  id: string;
  registration_id: string;
  author_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  category: EventCategory;
  status: EventStatus;
  start_date: string;
  end_date: string | null;
  registration_deadline: string | null;
  location: string;
  location_type: "in-person" | "virtual" | "hybrid";
  image_path: string | null;
  capacity: number | null;
  registration_count: number;
  is_featured: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationRow {
  id: string;
  event_id: string;
  user_id: string;
  status: "confirmed" | "waitlisted" | "cancelled" | "attended";
  registered_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  topics: string[];
  author_id: string | null;
  author_name: string | null;
  cover_image_path: string | null;
  read_time_minutes: number | null;
  is_featured: boolean;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  registration_number: string | null;
  university: string | null;
  subject: string;
  message: string;
  resume_path: string | null;
  status: "new" | "read" | "in_progress" | "resolved" | "archived";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}
