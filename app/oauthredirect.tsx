// app/oauthredirect.tsx

import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function OAuthRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const code = params?.code as string;

    if (code) {
      console.log("Redirect received code:", code);
    }

    // 🔥 IMPORTANT: immediately redirect away
    router.replace("/");
  }, []);

  return null;
}