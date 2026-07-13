import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

export function useMyParentInvitations() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const userPhone = session?.user?.phone;

  return useQuery({
    queryKey: ["my_parent_invitations", userId],
    queryFn: async () => {
      // The RLS policy should allow viewing if invited_phone matches the user's phone.
      const { data, error } = await supabase
        .from("parent_invitations")
        .select("*, child:children(*)")
        .eq("status", "pending");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useParentInvitations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const inviteParent = useCallback(async (childId: string, phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("invite_secondary_parent", {
        p_child_id: childId,
        p_phone: phone,
      });
      if (rpcError) throw rpcError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("accept_parent_invitation", {
        p_invitation_id: invitationId,
      });
      if (rpcError) throw rpcError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermissions = useCallback(async (childId: string, permissions: { can_edit: boolean; can_approve: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("update_secondary_permissions", {
        p_child_id: childId,
        p_permissions: permissions,
      });
      if (rpcError) throw rpcError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSecondaryParent = useCallback(async (childId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("remove_secondary_parent", {
        p_child_id: childId,
      });
      if (rpcError) throw rpcError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transferPrimaryRole = useCallback(async (childId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("transfer_primary_parent", {
        p_child_id: childId,
      });
      if (rpcError) throw rpcError;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inviteParent,
    acceptInvitation,
    updatePermissions,
    removeSecondaryParent,
    transferPrimaryRole,
    loading,
    error,
  };
}
