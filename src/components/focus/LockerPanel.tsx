import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ShieldCheck, ShieldOff, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLockerStore } from "@/stores/lockerStore";
import type { BlockerProfile } from "@/lib/db";

function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { name: string; domains: string[] };
  onSave: (name: string, domains: string[]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [domainsText, setDomainsText] = useState(initial?.domains.join("\n") ?? "");

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const domains = domainsText
      .split(/[\n,]/)
      .map((d) => d.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
      .filter(Boolean);
    onSave(trimmedName, domains);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#1A1A1A] p-4">
      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider">Profile Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Social Media"
          className="mt-1 h-8 border-white/10 bg-[#111] text-sm text-white"
        />
      </div>
      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider">
          Domains (one per line)
        </label>
        <textarea
          value={domainsText}
          onChange={(e) => setDomainsText(e.target.value)}
          placeholder={"twitter.com\nreddit.com\nyoutube.com"}
          rows={5}
          className="mt-1 w-full rounded-md border border-white/10 bg-[#111] px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white/40 hover:text-white"
        >
          <X size={14} />
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!name.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Check size={14} className="mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}

function ProfileRow({
  profile,
  onEdit,
  onDelete,
}: {
  profile: BlockerProfile;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-md border border-white/5 bg-[#1A1A1A] px-3 py-2.5">
      <ShieldCheck size={14} className="flex-shrink-0 text-orange-500/60" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">{profile.name}</p>
        <p className="text-[10px] text-white/30 truncate">
          {profile.domains.length} domain{profile.domains.length !== 1 ? "s" : ""}
          {profile.domains.length > 0 && ` · ${profile.domains.slice(0, 3).join(", ")}${profile.domains.length > 3 ? "…" : ""}`}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/10"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function LockerPanel() {
  const { profiles, hasPermission, isLoaded, loadProfiles, createProfile, updateProfile, deleteProfile, checkPermission } =
    useLockerStore();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      loadProfiles();
      checkPermission();
    }
  }, [isLoaded, loadProfiles, checkPermission]);

  async function handleCreate(name: string, domains: string[]) {
    await createProfile(name, domains);
    setCreating(false);
  }

  async function handleUpdate(id: string, name: string, domains: string[]) {
    await updateProfile(id, name, domains);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
          Focus Locker
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setCreating(true); setEditingId(null); }}
          className="h-6 px-2 text-white/40 hover:text-white"
        >
          <Plus size={12} className="mr-1" />
          New Profile
        </Button>
      </div>

      {/* Permission warning */}
      {hasPermission === false && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2">
          <ShieldOff size={12} className="text-red-400 flex-shrink-0" />
          <p className="text-[11px] text-red-400">
            No write permission to hosts file. Run as administrator to enable Focus Locker.
          </p>
        </div>
      )}

      {/* Create form */}
      {creating && (
        <ProfileForm
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Profile list */}
      <div className="flex flex-col gap-2">
        {profiles.length === 0 && !creating && (
          <p className="text-xs text-white/20 text-center py-4">
            No profiles yet. Create one to block distracting sites during focus.
          </p>
        )}
        {profiles.map((profile) =>
          editingId === profile.id ? (
            <ProfileForm
              key={profile.id}
              initial={{ name: profile.name, domains: profile.domains }}
              onSave={(name, domains) => handleUpdate(profile.id, name, domains)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ProfileRow
              key={profile.id}
              profile={profile}
              onEdit={() => { setEditingId(profile.id); setCreating(false); }}
              onDelete={() => deleteProfile(profile.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
