import { router } from "expo-router";
import { AppRoute } from "./types";

export const resetAndNavigate = (newPath: AppRoute) => {
    if (router.canGoBack()) {
        router.dismissAll();
    }
    router.replace(newPath);
}

