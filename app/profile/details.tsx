// app/profile/details.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Screen from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/config";
import Toast from "react-native-toast-message";

export default function ProfileDetails() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || null);
    }
  }, [user]);

  // 📸 PICK IMAGE
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!res.canceled) {
      setAvatar(res.assets[0].uri);
    }
  };

  // 💾 SAVE PROFILE
  const handleSave = async () => {
    console.log("Saving profile with", { name, phone, avatar });
    try {
      if (!name.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Name is required"
        });
        return;
      }

      setLoading(true);

      let avatarUrl = avatar;

      // 🔥 upload to supabase if new image
if (avatar && !avatar.startsWith("http")) {
  setUploading(true);

  const formData = new FormData();

  formData.append("file", {
    uri: avatar,
    name: "profile.jpg",
    type: "image/jpeg",
  } as any);

    const uploadRes = await api.post("/api/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
console.log("Upload response", uploadRes.data);
  avatarUrl = uploadRes.data.url;

  setUploading(false);
}

      // 🔥 only changed fields
      const payload: any = {};
      if (name !== user?.name) payload.name = name;
      if (phone !== user?.phone) payload.phone = phone;
      if (avatarUrl !== user?.avatar) payload.avatar = avatarUrl;

      if (Object.keys(payload).length === 0) {
        Toast.show({
          type: "error",
          text1: "No changes",
          text2: "Nothing to update"
        });
        return;
      }

      const res = await api.put("/api/user/update", payload);

      setUser(res.data.user);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated"
      });
      router.back();
    } catch (err) {
      console.log("Update error", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong"
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text>Please login to view profile</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Edit Profile</Text>

          {/* 🔥 AVATAR */}
          <View style={styles.avatarBox}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{
                  uri:
                    avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />

              {uploading && (
                <View style={styles.overlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.changeText}>Tap to change photo</Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.card}>
            {/* NAME */}
            <View style={styles.inputBox}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter your name"
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputBox}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={user.email}
                editable={false}
                style={[styles.input, styles.disabled]}
              />
            </View>

            {/* PHONE */}
            <View style={styles.inputBox}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 20,
  },

  avatarBox: {
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },

  overlay: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  changeText: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  inputBox: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  disabled: {
    opacity: 0.5,
  },

  btn: {
    marginTop: 25,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});