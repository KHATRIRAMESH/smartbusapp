import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  async set(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  async delete(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting secure item:', error);
    }
  }

  async clearAll() {
    const keys = ['access_token', 'refresh_token', 'user', 'role'];
    await Promise.all(keys.map(key => this.delete(key)));
  }
}

export const tokenStorage = new SecureStorage();

// export const storage = new MMKV({
//   id: "storage",
//   encryptionKey:
//     "g+mWimqjjPFTf99dJIyhNs4hdu3RhPcsBlc7SUopVLryMSSQzrw0ogfi6qOV+PoW",
// });

// export const mmkvStorage = {
//   setItem: (key: string, value: string) => {
//     storage.set(key, value);
//   },
//   getItem: (key: string) => {
//     const value = storage.getString(key);
//     return value ? value : null;
//   },
//   removeItem: (key: string) => {
//     storage.delete(key);
//   },
// };
