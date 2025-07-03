import { MMKV } from "react-native-mmkv";

export const tokenStorage = new MMKV({
  id: "token-storage",
  encryptionKey:
    "g+mWimqjjPFTf99dJIyhNs4hdu3RhPcsBlc7SUopVLryMSSQzrw0ogfi6qOV+PoW",
});

export const storage = new MMKV({
  id: "storage",
  encryptionKey:
    "g+mWimqjjPFTf99dJIyhNs4hdu3RhPcsBlc7SUopVLryMSSQzrw0ogfi6qOV+PoW",
});

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ? value : null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};
