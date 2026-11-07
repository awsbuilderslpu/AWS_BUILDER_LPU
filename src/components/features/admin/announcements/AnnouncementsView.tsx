"use client";

import * as React from "react";
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  BookOpen,
  AlertTriangle,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  togglePublishAnnouncementAction,
  deleteAnnouncementAction,
} from "@/lib/notifications/actions";
import type {
  AnnouncementItem,
  NotificationType,
} from "@/lib/notifications/types";
import { AnnouncementDrawer } from "./AnnouncementDrawer";

interface AnnouncementsViewProps {
  initialAnnouncements: AnnouncementItem[];
}

export function AnnouncementsView({
  initialAnnouncements,
}: AnnouncementsViewProps) {
  const [items, setItems] = React.useState<AnnouncementItem[]>(initialAnnouncements);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AnnouncementItem | null>(null);

  // Sync state if initialAnnouncements changes
  React.useEffect(() => {
    setItems(initialAnnouncements);
  }, [initialAnnouncements]);

  const handleCreate = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleTogglePublish = async (item: AnnouncementItem) => {
    const nextState = !item.is_published;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_published: nextState } : i))
    );
    try {
      const res = await togglePublishAnnouncementAction(item.id, nextState);
      if (res.ok) {
        toast.success(nextState ? "Published notification." : "Unpublished notification.");
        window.dispatchEvent(new CustomEvent("announcements-updated"));
      } else {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_published: item.is_published } : i))
        );
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      // Rollback
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_published: item.is_published } : i))
      );
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await deleteAnnouncementAction(id);
      if (res.ok) {
        toast.success("Notification deleted.");
        window.dispatchEvent(new CustomEvent("announcements-updated"));
      } else {
        setItems(previous);
        toast.error(res.error || "Failed to delete notification.");
      }
    } catch {
      setItems(previous);
      toast.error("Failed to delete notification.");
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter === "published" && !item.is_published) return false;
      if (statusFilter === "draft" && item.is_published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.author_name && item.author_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, search, typeFilter, statusFilter]);

  const totalCount = items.length;
  const publishedCount = items.filter((i) => i.is_published).length;
  const urgentCount = items.filter((i) => i.priority === "urgent" || i.priority === "high").length;
  const draftCount = totalCount - publishedCount;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "event":
        return <Calendar className="size-4 text-amber-500" />;
      case "blog":
        return <BookOpen className="size-4 text-sky-400" />;
      case "alert":
        return <AlertTriangle className="size-4 text-rose-400" />;
      case "announcement":
      default:
        return <Megaphone className="size-4 text-emerald-400" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "event":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            {getTypeIcon(type)} Event
          </span>
        );
      case "blog":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
            {getTypeIcon(type)} Blog
          </span>
        );
      case "alert":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
            {getTypeIcon(type)} Alert
          </span>
        );
      case "announcement":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            {getTypeIcon(type)} Announcement
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Notifications & Announcements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Broadcast club updates, event alerts, and system notifications to members and staff.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-primary text-black font-semibold hover:bg-primary/90 cursor-pointer shadow-[0_0_15px_rgba(255,153,0,0.3)]"
        >
          <Plus className="size-4 stroke-[2.5]" />
          New Notification
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            <Bell className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totalCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">All announcements</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Published</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{publishedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Active in notification bell</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">High / Urgent</span>
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{urgentCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">High priority broadcasts</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Drafts</span>
            <Clock className="size-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{draftCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Unpublished drafts</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="h-10 w-full rounded-md border border-border bg-card/60 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-card/80 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="announcement">Announcements</option>
            <option value="event">Events</option>
            <option value="blog">Blogs</option>
            <option value="alert">Alerts</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-card/80 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-[#060c18]">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-base font-semibold text-white">No notifications found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Create your first notification broadcast to notify members."}
            </p>
            {!search && (
              <Button onClick={handleCreate} className="mt-4 bg-primary text-black font-semibold hover:bg-primary/90">
                <Plus className="size-4 mr-1.5" />
                Create Notification
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-white/[0.02]"
              >
                {/* Left: Info */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(item.type)}
                    {item.priority === "urgent" && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-400">
                        Urgent
                      </span>
                    )}
                    {item.priority === "high" && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        High Priority
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground capitalize">
                      Audience: {item.target_audience === "all" ? "All Users" : item.target_audience}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-300 line-clamp-2 max-w-2xl">
                    {item.description}
                  </p>

                  {item.href && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <ExternalLink className="size-3" />
                      <span>{item.href}</span>
                    </div>
                  )}
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {/* Clickable Status Badge */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    title={item.is_published ? "Click to unpublish" : "Click to publish"}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-all duration-150",
                      item.is_published
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-slate-500/10 text-slate-300 border border-slate-500/30 hover:bg-slate-500/20 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        item.is_published ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      )}
                    />
                    {item.is_published ? "Published" : "Draft"}
                  </button>

                  {/* Quick Action Toggle Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(item)}
                    className={cn(
                      "h-8 px-2.5 text-xs font-semibold cursor-pointer border hidden sm:inline-flex items-center",
                      item.is_published
                        ? "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                    )}
                  >
                    {item.is_published ? (
                      <>
                        <EyeOff className="size-3.5 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Actions"
                        className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card/60 text-muted-foreground transition-colors hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 border-border bg-[#091122] text-white">
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(item)}
                        className="cursor-pointer gap-2"
                      >
                        {item.is_published ? (
                          <>
                            <EyeOff className="size-4 text-slate-400" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Eye className="size-4 text-emerald-400" />
                            <span>Publish</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleEdit(item)}
                        className="cursor-pointer gap-2"
                      >
                        <Edit2 className="size-4 text-sky-400" />
                        <span>Edit</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="cursor-pointer gap-2 text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnnouncementDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        announcement={editingItem}
        onSaved={async () => {
          // Re-fetch client side
          const { fetchAnnouncementsAction } = await import("@/lib/notifications/actions");
          const fresh = await fetchAnnouncementsAction();
          setItems(fresh);
          window.dispatchEvent(new CustomEvent("announcements-updated"));
        }}
      />
    </div>
  );
}
