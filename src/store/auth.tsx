import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "@/services/api";

type User = {
  _id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: string;
  token?: string;
};

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    otp: string,
  ) => Promise<{ error: string | null }>;
  signInWithShiprocket: (
    phone: string,
    authorisedCustomerToken: string,
    addressData: any,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === "admin");
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      setIsAdmin(data.role === "admin");
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || "Invalid email or password" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    otp: string,
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
        phone,
        otp,
      });
      setUser(data);
      setIsAdmin(data.role === "admin");
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || "Failed to register" };
    }
  };

  const updateProfile = async (updateData: Partial<User>) => {
    try {
      const { data } = await api.put("/auth/profile", updateData);
      const mergedUser = { ...user, ...data };
      setUser(mergedUser);
      setIsAdmin(mergedUser.role === "admin");
      localStorage.setItem("userInfo", JSON.stringify(mergedUser));
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || "Failed to update profile" };
    }
  };

  const signInWithShiprocket = async (
    phone: string,
    authorisedCustomerToken: string,
    addressData: any,
  ) => {
    try {
      const { data } = await api.post("/auth/shiprocket-login", {
        phone,
        authorised_customer_token: authorisedCustomerToken,
        address_data: addressData,
      });
      setUser(data);
      setIsAdmin(data.role === "admin");
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || "Failed to login with Shiprocket" };
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("userInfo");
  };

  return (
    <Ctx.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        signInWithShiprocket,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
