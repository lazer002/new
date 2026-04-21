
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

export default function AddAddress() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const isEdit = !!id;

  const [form, setForm] = useState({
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
    if (isEdit) fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      const res = await api.get(`/api/address/${id}`);
      setForm(res.data.address);
    } catch {}
  };

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) return;

    try {
      setLoading(true);

      if (isEdit) {
        await api.put(`/api/address/${id}`, form);
      } else {
        await api.post(`/api/address`, form);
      }

      router.back();
    } catch (err) {
      console.log(err);
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
          <Input label="Full Name" value={form.name} onChange={(v: string) => handleChange("name", v)} />
          <Input label="Phone Number" value={form.phone} onChange={(v: string) => handleChange("phone", v)} keyboard="phone-pad" />
          <Input label="Address" value={form.address} onChange={(v: string) => handleChange("address", v)} />
          <Input label="City" value={form.city} onChange={(v: string) => handleChange("city", v)} />
          <Input label="State" value={form.state} onChange={(v: string) => handleChange("state", v)} />
          <Input label="ZIP Code" value={form.zip} onChange={(v: string) => handleChange("zip", v)} keyboard="numeric" />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Address"}
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
}: any) => (
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

