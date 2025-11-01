import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qpenkaurptbxsxrysixw.supabase.co/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZW5rYXVycHRieHN4cnlzaXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTE5MTUsImV4cCI6MjA3MjI2NzkxNX0.vYnYQ_LmwwVYuaNSfu2n3KESbZi6xMLleR4-ei98Obo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});