import { Stack } from "expo-router";
import { StatusBar } from "react-native";
// import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { AuthProvider } from "@/components/AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="orange"
            translucent={false}
          />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
