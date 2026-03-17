import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
}
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllRegistrations(): Promise<Array<Registration>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<string>>;
    getMyRegistrations(): Promise<Array<Registration>>;
    getProductCount(category: string, product: string): Promise<bigint>;
    getProductsForCategory(category: string): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerForProduct(category: string, product: string, name: string, phone: string, location: string, requirements: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
