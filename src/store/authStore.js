import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,
  isCustomer: false,
  isStaff: false,
  isAdmin: false,

  initializeAuth: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle(); // Fixed
        
        const { data: staffData } = await supabase
          .from('hotel_staff')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle(); // Fixed
        
        set({
          user,
          userProfile: customerData || staffData,
          isCustomer: !!customerData,
          isStaff: !!staffData,
          isAdmin: staffData?.role === 'admin',
          isLoading: false,
          error: null,
        });
      } else {
        set({ user: null, userProfile: null, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_id', data.user.id)
        .maybeSingle(); // Fixed
      
      const { data: staffData } = await supabase
        .from('hotel_staff')
        .select('*')
        .eq('auth_id', data.user.id)
        .maybeSingle(); // Fixed
      
      set({
        user: data.user,
        userProfile: customerData || staffData,
        isCustomer: !!customerData,
        isStaff: !!staffData,
        isAdmin: staffData?.role === 'admin',
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  signup: async (email, password, fullName, userType = 'customer') => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, user_type: userType } },
      });
      if (error) throw error;
      
      if (userType === 'customer') {
        const { error: customerError } = await supabase
          .from('customers')
          .insert([{ auth_id: data.user.id, email, full_name: fullName }]);
        if (customerError) throw customerError;
      }
      
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, userProfile: null, isCustomer: false, isStaff: false, isAdmin: false, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const userType = get().isCustomer ? 'customers' : 'hotel_staff';
      const { data, error } = await supabase
        .from(userType)
        .update(updates)
        .eq('auth_id', get().user.id)
        .select()
        .maybeSingle(); // Fixed
      
      if (error) throw error;
      set({ userProfile: data, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
}));