import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceProviderProfile {
    name: string;
    businessName: string;
    category: string;
    phone: string;
}
export type Time = bigint;
export interface Registration {
    id: bigint;
    userId: string;
    name: string;
    timestamp: Time;
    category: string;
    phone: string;
    requirements: string;
    location: string;
    product: string;
}
export interface CustomSlotMember {
    userId: string;
    name: string;
    joinedAt: Time;
    slotId: bigint;
    phone: string;
    requirements: string;
    location: string;
}
export interface Quote {
    id: bigint;
    title: string;
    slotKey: string;
    serviceProviderId: string;
    businessName: string;
    description: string;
    timestamp: Time;
    providerName: string;
    price: string;
}
export interface CustomSlot {
    id: bigint;
    title: string;
    createdAt: Time;
    creatorId: string;
    description: string;
    maxMembers: bigint;
    category: string;
    location: string;
}
export interface ChatMessage {
    id: bigint;
    memberId: string;
    senderIsProvider: boolean;
    slotKey: string;
    content: string;
    serviceProviderId: string;
    timestamp: Time;
}
export interface PublicRegistration {
    requirements: string;
    location: string;
    product: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomSlot(title: string, category: string, description: string, location: string, maxMembers: bigint, creatorName: string, creatorPhone: string, creatorRequirements: string): Promise<bigint>;
    deleteRegistration(registrationId: bigint): Promise<string>;
    getAllRegistrations(): Promise<Array<Registration>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<string>>;
    getChatMessages(category: string, product: string, serviceProviderId: string): Promise<Array<ChatMessage>>;
    getCustomSlotMemberCount(slotId: bigint): Promise<bigint>;
    getCustomSlotMembers(slotId: bigint): Promise<Array<CustomSlotMember>>;
    getCustomSlots(): Promise<Array<CustomSlot>>;
    getCustomSlotsForCategory(category: string): Promise<Array<CustomSlot>>;
    getMyRegistrations(): Promise<Array<Registration>>;
    getMyServiceProviderProfile(): Promise<ServiceProviderProfile | null>;
    getProductCount(category: string, product: string): Promise<bigint>;
    getProductsForCategory(category: string): Promise<Array<string>>;
    getProviderChatMessages(category: string, product: string, memberId: string): Promise<Array<ChatMessage>>;
    getPublicRegistrationsForCategory(category: string): Promise<Array<PublicRegistration>>;
    getQuotesForSlot(category: string, product: string): Promise<Array<Quote>>;
    getSlotMembers(category: string, product: string): Promise<Array<Registration>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasSpPaidForSlot(category: string, product: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCustomSlotMember(slotId: bigint): Promise<boolean>;
    joinCustomSlot(slotId: bigint, name: string, phone: string, location: string, requirements: string): Promise<string>;
    recordSpSlotPayment(category: string, product: string): Promise<void>;
    registerForProduct(category: string, product: string, name: string, phone: string, location: string, requirements: string): Promise<string>;
    registerServiceProvider(profile: ServiceProviderProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendChatMessage(category: string, product: string, serviceProviderId: string, content: string, senderIsProvider: boolean): Promise<void>;
    sendChatMessageAsProvider(category: string, product: string, memberId: string, content: string): Promise<void>;
    submitQuote(category: string, product: string, title: string, description: string, price: string): Promise<void>;
}
