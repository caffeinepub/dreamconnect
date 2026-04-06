import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Registration, UserProfile } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

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
  const { actor, isReady: actorIsReady } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();
  const mutation = useMutation({
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
      if (!identity) throw new Error("Please sign in first");
      if (!actor || !isAuthenticated)
        throw new Error("Please wait while we connect your account...");
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
  return {
    ...mutation,
    isActorReady: !!identity && !!actor && actorIsReady,
  };
}

export function useMyRegistrations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? null;
  return useQuery<Registration[]>({
    // Include principal in key so query refreshes when identity changes
    queryKey: ["myRegistrations", principalKey],
    queryFn: async () => {
      if (!actor || !principalKey) return [];
      return actor.getMyRegistrations();
    },
    // Only run when user is actually authenticated (not anonymous actor)
    enabled: !!actor && !isFetching && !!principalKey,
    retry: false,
  });
}

export function useAllRegistrations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? null;
  return useQuery<Registration[]>({
    queryKey: ["allRegistrations", principalKey],
    queryFn: async () => {
      if (!actor || !principalKey) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching && !!principalKey,
    retry: false,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? null;
  return useQuery<boolean>({
    queryKey: ["isAdmin", principalKey],
    queryFn: async () => {
      if (!actor || !principalKey) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!principalKey,
    staleTime: 60000,
    retry: false,
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
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? null;
  return useQuery<Registration[]>({
    queryKey: ["slotMembers", category, product, principalKey],
    queryFn: async () => {
      if (!actor || !principalKey) return [];
      return (actor as any).getSlotMembers(category, product);
    },
    enabled:
      !!actor && !isFetching && !!category && !!product && !!principalKey,
    refetchInterval: 15000,
    retry: false,
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

// ===== CUSTOM SLOT HOOKS =====

export interface CustomSlot {
  id: bigint;
  title: string;
  category: string;
  description: string;
  location: string;
  creatorId: string;
  maxMembers: bigint;
  createdAt: bigint;
}

export interface CustomSlotMember {
  slotId: bigint;
  userId: string;
  name: string;
  phone: string;
  location: string;
  requirements: string;
  joinedAt: bigint;
}

export interface PublicRegistration {
  product: string;
  location: string;
  requirements?: string;
}

export function useCustomSlots() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const principalKey = identity?.getPrincipal().toString() ?? "anon";
  return useQuery<CustomSlot[]>({
    queryKey: ["customSlots", principalKey],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCustomSlots();
    },
    enabled: !!actor,
    refetchInterval: 15000,
    staleTime: 0,
  });
}

export function useCreateCustomSlot() {
  const { actor, isReady: actorIsReady } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (vars: {
      title: string;
      category: string;
      description: string;
      location: string;
      maxMembers: number;
      creatorName: string;
      creatorPhone: string;
      creatorRequirements: string;
    }) => {
      if (!identity) throw new Error("Please sign in first");
      if (!actor || !isAuthenticated)
        throw new Error("Please wait while we connect your account...");
      return (actor as any).createCustomSlot(
        vars.title,
        vars.category,
        vars.description,
        vars.location,
        BigInt(vars.maxMembers),
        vars.creatorName,
        vars.creatorPhone,
        vars.creatorRequirements,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customSlots"] });
      queryClient.invalidateQueries({ queryKey: ["customSlotMembers"] });
      queryClient.invalidateQueries({ queryKey: ["customSlotMemberCount"] });
      queryClient.invalidateQueries({ queryKey: ["isCustomSlotMember"] });
    },
  });
  return {
    ...mutation,
    isActorReady: !!identity && !!actor && actorIsReady,
  };
}

export function useJoinCustomSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      slotId: bigint;
      name: string;
      phone: string;
      location: string;
      requirements: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).joinCustomSlot(
        vars.slotId,
        vars.name,
        vars.phone,
        vars.location,
        vars.requirements,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customSlots"] });
      queryClient.invalidateQueries({ queryKey: ["customSlotMembers"] });
      queryClient.invalidateQueries({ queryKey: ["isCustomSlotMember"] });
    },
  });
}

export function useCustomSlotMemberCount(slotId: bigint | null) {
  const { actor } = useActor();
  return useQuery<number>({
    queryKey: ["customSlotMemberCount", slotId?.toString()],
    queryFn: async () => {
      if (!actor || slotId === null) return 0;
      const count = await (actor as any).getCustomSlotMemberCount(slotId);
      return Number(count);
    },
    enabled: !!actor && slotId !== null,
    refetchInterval: 15000,
  });
}

export function useCustomSlotMembers(slotId: bigint | null) {
  const { actor } = useActor();
  return useQuery<CustomSlotMember[]>({
    queryKey: ["customSlotMembers", slotId?.toString()],
    queryFn: async () => {
      if (!actor || slotId === null) return [];
      return (actor as any).getCustomSlotMembers(slotId);
    },
    enabled: !!actor && slotId !== null,
    refetchInterval: 15000,
    refetchOnMount: true,
  });
}

export function useIsCustomSlotMember(slotId: bigint | null) {
  const { actor } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCustomSlotMember", slotId?.toString()],
    queryFn: async () => {
      if (!actor || slotId === null) return false;
      return (actor as any).isCustomSlotMember(slotId);
    },
    enabled: !!actor && slotId !== null,
  });
}

export function usePublicRegistrationsForCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PublicRegistration[]>({
    queryKey: ["publicRegs", category],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPublicRegistrationsForCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 30000,
  });
}

export function useDeleteRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: bigint) => {
      if (!actor) throw new Error("Not signed in");
      return (actor as any).deleteRegistration(registrationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["publicRegistrations"] });
    },
  });
}
