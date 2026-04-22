
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/utils/config";

type FormType = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

export default function AddAddress() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // 🔥 FIX param type
  const addressId = Array.isArray(id) ? id[0] : id;
  const isEdit = !!addressId;

  const [form, setForm] = useState<FormType>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------- FETCH (EDIT MODE) ---------- */
  useEffect(() => {
    if (addressId) fetchAddress();
  }, [addressId]);

  const fetchAddress = async () => {
    try {
      const res = await api.get(`/api/address/${addressId}`);

      const data = res.data.address;

      setForm({
        name: data?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
        city: data?.city || "",
        state: data?.state || "",
        zip: data?.zip || "",
      });
    } catch (err) {
      console.log("Fetch error", err);
    }
  };

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (key: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) {
      console.log("Validation failed");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await api.put(`/api/address/${addressId}`, form);
      } else {
        await api.post(`/api/address`, form);
      }

      router.back();
    } catch (err) {
      console.log("Save error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {isEdit ? "Edit Address" : "Add Address"}
          </Text>

          <View style={{ width: 26 }} />
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Input label="Full Name" value={form.name} onChange={(v) => handleChange("name", v)} />
          <Input label="Phone Number" value={form.phone} onChange={(v) => handleChange("phone", v)} keyboard="phone-pad" />
          <Input label="Address" value={form.address} onChange={(v) => handleChange("address", v)} />
          <Input label="City" value={form.city} onChange={(v) => handleChange("city", v)} />
          <Input label="State" value={form.state} onChange={(v) => handleChange("state", v)} />
          <Input label="ZIP Code" value={form.zip} onChange={(v) => handleChange("zip", v)} keyboard="numeric" />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : isEdit ? "Update Address" : "Save Address"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* 🔹 INPUT COMPONENT */
const Input = ({
  label,
  value,
  onChange,
  keyboard = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: any;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      style={styles.input}
      placeholder={label}
    />
  </View>
);

/* 🎨 STYLES */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  form: {
    padding: 16,
  },

  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  saveBtn: {
    backgroundColor: "#111",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});

