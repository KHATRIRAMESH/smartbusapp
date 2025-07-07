import AsyncStorage from '@react-native-async-storage/async-storage';

class SecureStorage {
  private readonly STORAGE_KEYS = [
    'access_token',
    'refresh_token',
    'user',
    'user_role',
  ];

  async set(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing item:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  async delete(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(this.STORAGE_KEYS);
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Fallback to individual deletion if multiRemove fails
      await Promise.all(this.STORAGE_KEYS.map(key => this.delete(key)));
    }
  }
}

export const tokenStorage = new SecureStorage();


