import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuth = () => {
  const login = async (email, password) => {
    // Validate
    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));

    const user = {
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'User',
      email,
      loginTime: Date.now(),
      checksCount: 0,
      scamsBlocked: 0,
    };

    await AsyncStorage.setItem('fraudshield_user', JSON.stringify(user));
    return { success: true, user };
  };

  const signup = async (name, email, mobile, password) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 2000));

    const user = {
      name,
      email,
      mobile,
      loginTime: Date.now(),
      checksCount: 0,
      scamsBlocked: 0,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    };

    await AsyncStorage.setItem('fraudshield_user', JSON.stringify(user));
    return { success: true, user };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('fraudshield_user');
  };

  const checkSession = async () => {
    try {
      const userStr = await AsyncStorage.getItem('fraudshield_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const updateUser = async (updates) => {
    try {
      const userStr = await AsyncStorage.getItem('fraudshield_user');
      if (userStr) {
        const user = { ...JSON.parse(userStr), ...updates };
        await AsyncStorage.setItem('fraudshield_user', JSON.stringify(user));
        return user;
      }
    } catch {
      return null;
    }
  };

  return { login, signup, logout, checkSession, updateUser };
};

export default useAuth;
