import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Registration, UserProfile } from "../backend";
import { useActor } from "./useActor";

export type { Registration, UserProfile };

export function useProductsForCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsForCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 60000,
  });
}

export function useProductCounts(category: string, products: string[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["productCounts", category, products],
    queryFn: async () => {
      if (!actor || products.length === 0) return {};
      const counts = await Promise.all(
        products.map((p) => actor.getProductCount(category, p)),
      );
      const result: Record<string, number> = {};
      products.forEach((p, i) => {
        result[p] = Number(counts[i]);
      });
      return result;
    },
    enabled: !!actor && !isFetching && products.length > 0,
    refetchInterval: 30000,
  });
}

export function useRegisterForProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      product,
      name,
      phone,
      location,
      requirements,
    }: {
      category: string;
      product: string;
      name: string;
      phone: string;
      location: string;
      requirements: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerForProduct(
        category,
        product,
        name,
        phone,
        location,
        requirements,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productCounts", variables.category],
      });
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
    },
  });
}

export function useMyRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["myRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["allRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
