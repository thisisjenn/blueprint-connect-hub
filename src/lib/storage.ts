import { supabase } from "@/integrations/supabase/client";

/**
 * Open a private project file via a short-lived signed URL.
 * `pathOrUrl` may be either a storage path (preferred) or a legacy
 * full URL stored in the DB; in the latter case we fall back to the URL.
 */
export async function openProjectFile(pathOrUrl: string, download = false) {
  if (!pathOrUrl) return;

  // Legacy rows may have a full http(s) URL — use as-is.
  if (/^https?:\/\//i.test(pathOrUrl)) {
    window.open(pathOrUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const { data, error } = await supabase.storage
    .from("project-files")
    .createSignedUrl(pathOrUrl, 3600, download ? { download: true } : undefined);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL", error);
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}