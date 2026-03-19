import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Registration, UserProfile } from "../backend";
import { useActor } from "./useActor";

export type { Registration, UserProfile };

// Local type definitions for new backend features
export interface ServiceProviderProfile {
  name: string;
  businessName: string;
  category: string;
  phone: string;
}

export interface Quote {
  id: bigint;
  slotKey: string;
  serviceProviderId: string;
  providerName: string;
  businessName: string;
  title: string;
  description: string;
  price: string;
  timestamp: bigint;
}

export interface ChatMessage {
  id: bigint;
  slotKey: string;
  serviceProviderId: string;
  memberId: string;
  senderIsProvider: boolean;
  content: string;
  timestamp: bigint;
}

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

// ===== SERVICE PROVIDER HOOKS =====

export function useMyServiceProviderProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<ServiceProviderProfile | null>({
    queryKey: ["myServiceProviderProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).getMyServiceProviderProfile();
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

export function useRegisterServiceProvider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: ServiceProviderProfile) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).registerServiceProvider(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myServiceProviderProfile"],
      });
    },
  });
}

export function useSlotMembers(category: string, product: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["slotMembers", category, product],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getSlotMembers(category, product);
    },
    enabled: !!actor && !isFetching && !!category && !!product,
    refetchInterval: 15000,
  });
}

export function useQuotesForSlot(category: string, product: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Quote[]>({
    queryKey: ["quotesForSlot", category, product],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getQuotesForSlot(category, product);
    },
    enabled: !!actor && !isFetching && !!category && !!product,
    refetchInterval: 10000,
  });
}

export function useSubmitQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      category: string;
      product: string;
      title: string;
      description: string;
      price: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).submitQuote(
        vars.category,
        vars.product,
        vars.title,
        vars.description,
        vars.price,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["quotesForSlot", vars.category, vars.product],
      });
    },
  });
}

export function useChatMessages(
  category: string,
  product: string,
  serviceProviderId: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatMessages", category, product, serviceProviderId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getChatMessages(
        category,
        product,
        serviceProviderId,
      );
    },
    enabled: !!actor && !isFetching && !!serviceProviderId,
    refetchInterval: 3000,
  });
}

export function useProviderChatMessages(
  category: string,
  product: string,
  memberId: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["providerChatMessages", category, product, memberId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getProviderChatMessages(
        category,
        product,
        memberId,
      );
    },
    enabled: !!actor && !isFetching && !!memberId,
    refetchInterval: 3000,
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      category: string;
      product: string;
      serviceProviderId: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).sendChatMessage(
        vars.category,
        vars.product,
        vars.serviceProviderId,
        vars.content,
        false,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [
          "chatMessages",
          vars.category,
          vars.product,
          vars.serviceProviderId,
        ],
      });
    },
  });
}

export function useSendChatMessageAsProvider() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      category: string;
      product: string;
      memberId: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).sendChatMessageAsProvider(
        vars.category,
        vars.product,
        vars.memberId,
        vars.content,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [
          "providerChatMessages",
          vars.category,
          vars.product,
          vars.memberId,
        ],
      });
    },
  });
}

// ===== PAYMENT HOOKS =====

export function useHasSpPaidForSlot(category: string, product: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasSpPaidForSlot", category, product],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasSpPaidForSlot(category, product);
    },
    enabled: !!actor && !isFetching && !!category && !!product,
  });
}

export function useRecordSpSlotPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      product,
    }: { category: string; product: string }) =>
      actor!.recordSpSlotPayment(category, product),
    onSuccess: (_, { category, product }) => {
      queryClient.invalidateQueries({
        queryKey: ["hasSpPaidForSlot", category, product],
      });
    },
  });
}
