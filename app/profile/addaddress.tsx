import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardTypeOptions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/utils/config";
import * as Location from "expo-location";
type FormType = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const LIME = "#B6FF2E";
const BLACK = "#111111";
const MUTED = "#777777";
const SOFT = "#F5F5F5";

export default function AddAddress() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const addressId = Array.isArray(id) ? id[0] : id;
  const isEdit = !!addressId;
const [locationLoading, setLocationLoading] = useState(false);
  const [form, setForm] = useState<FormType>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------- FETCH EDIT ADDRESS ---------- */

  useEffect(() => {
    if (addressId) {
      fetchAddress();
    }
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

  const handleChange = (
    key: keyof FormType,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
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
        await api.put(
          `/api/address/${addressId}`,
          form
        );
      } else {
        await api.post("/api/address", form);
      }

      router.back();
    } catch (err) {
      console.log("Save error", err);
    } finally {
      setLoading(false);
    }
  };


const autofillCurrentLocation = async () => {
  try {
    setLocationLoading(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return;
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    const { latitude, longitude } =
      location.coords;

    const result =
      await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

    if (result.length > 0) {
      const place = result[0];

      setForm((prev) => ({
        ...prev,

        // Street / Area
        address:
          [
            place.name,
            place.street,
            place.district,
            place.subregion,
          ]
            .filter(Boolean)
            .join(", ") || prev.address,

        // City
        city:
          place.city ||
          place.subregion ||
          prev.city,

        // State
        state:
          place.region ||
          prev.state,

        // PIN Code
        zip:
          place.postalCode ||
          prev.zip,
      }));
    }
  } catch (error) {
    console.log(
      "Location autofill error:",
      error
    );
  } finally {
    setLocationLoading(false);
  }
};


  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <KeyboardAvoidingView
     behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
  style={styles.container}
      >
        {/* ---------- HEADER ---------- */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={BLACK}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>
              DELIVERY DETAILS
            </Text>

            <Text style={styles.title}>
              {isEdit
                ? "Edit Address"
                : "New Address"}
            </Text>
          </View>

    <TouchableOpacity
  activeOpacity={0.8}
  style={styles.headerIcon}
  onPress={autofillCurrentLocation}
  disabled={locationLoading}
>
  {locationLoading ? (
    <ActivityIndicator
      size="small"
      color={BLACK}
    />
  ) : (
    <Ionicons
      name="locate-outline"
      size={21}
      color={BLACK}
    />
  )}
</TouchableOpacity>
        </View>

        {/* ---------- FORM ---------- */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* INTRO */}

          <View style={styles.intro}>
            <Text style={styles.introTitle}>
              {isEdit
                ? "UPDATE YOUR DETAILS"
                : "WHERE SHOULD WE DELIVER?"}
            </Text>

            <Text style={styles.introDescription}>
              {isEdit
                ? "Make changes to your delivery information below."
                : "Enter your delivery information for a faster checkout experience."}
            </Text>
          </View>

          {/* CONTACT */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>
                  01
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                CONTACT INFORMATION
              </Text>
            </View>

            <Input
              label="FULL NAME"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(v) =>
                handleChange("name", v)
              }
              icon="person-outline"
            />

            <Input
              label="PHONE NUMBER"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(v) =>
                handleChange("phone", v)
              }
              keyboard="phone-pad"
              icon="call-outline"
            />
          </View>

          {/* ADDRESS */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>
                  02
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                DELIVERY ADDRESS
              </Text>
            </View>

            <Input
              label="ADDRESS"
              placeholder="House no, building, street"
              value={form.address}
              onChange={(v) =>
                handleChange("address", v)
              }
              icon="home-outline"
              multiline
            />

            <Input
              label="CITY"
              placeholder="Enter city"
              value={form.city}
              onChange={(v) =>
                handleChange("city", v)
              }
              icon="business-outline"
            />

            {/* STATE + ZIP */}
            

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <Input
                  label="STATE"
                  placeholder="State"
                  value={form.state}
                  onChange={(v) =>
                    handleChange("state", v)
                  }
                />
              </View>

              <View style={styles.halfInput}>
                <Input
                  label="PIN CODE"
                  placeholder="000000"
                  value={form.zip}
                  onChange={(v) =>
                    handleChange("zip", v)
                  }
                  keyboard="numeric"
                />
              </View>
            </View>
          </View>

          {/* INFO CARD */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={BLACK}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                YOUR INFORMATION IS SECURE
              </Text>

              <Text style={styles.infoText}>
                Your address is only used to deliver
                your GARRIB orders.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ---------- BOTTOM SAVE ---------- */}

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text style={styles.saveText}>
                  {isEdit
                    ? "UPDATE ADDRESS"
                    : "SAVE ADDRESS"}
                </Text>

                <View style={styles.arrowButton}>
                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={BLACK}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ======================================================
   INPUT COMPONENT
====================================================== */

const Input = ({
  label,
  value,
  onChange,
  keyboard = "default",
  placeholder,
  icon,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: KeyboardTypeOptions;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          multiline && styles.multilineContainer,
        ]}
      >
        {icon && (
          <View style={styles.inputIcon}>
            <Ionicons
              name={icon}
              size={19}
              color={focused ? BLACK : "#999999"}
            />
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          multiline={multiline}
          textAlignVertical={
            multiline ? "top" : "center"
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
        />

        {value.length > 0 && !multiline && (
          <Ionicons
            name="checkmark-circle"
            size={19}
            color={LIME}
          />
        )}
      </View>
    </View>
  );
};

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 16,
  },

  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: MUTED,
    marginBottom: 3,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: BLACK,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
  },

  /* SCROLL */

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  /* INTRO */

  intro: {
    backgroundColor: BLACK,
    borderRadius: 24,
    padding: 22,
    marginBottom: 30,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  introDescription: {
    color: "#AFAFAF",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 290,
  },

  /* SECTION */

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionNumber: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionNumberText: {
    fontSize: 9,
    fontWeight: "900",
    color: BLACK,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: BLACK,
  },

  /* INPUT */

  inputWrapper: {
    marginBottom: 17,
  },

  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: MUTED,
    marginBottom: 8,
    marginLeft: 3,
  },

  inputContainer: {
    minHeight: 58,
    backgroundColor: SOFT,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  inputFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: BLACK,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    height: 56,
    fontSize: 14,
    fontWeight: "500",
    color: BLACK,
    paddingVertical: 0,
  },

  multilineContainer: {
    minHeight: 90,
    alignItems: "flex-start",
    paddingTop: 17,
  },

  multilineInput: {
    height: 65,
    paddingTop: 0,
  },

  inputRow: {
    flexDirection: "row",
    gap: 12,
  },

  halfInput: {
    flex: 1,
  },

  /* INFO */

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 20,
    padding: 16,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: BLACK,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
    marginTop: 4,
  },

  /* BOTTOM */

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    // paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  saveButton: {
    height: 60,
    borderRadius: 30,
    backgroundColor: BLACK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 7,
  },

  saveButtonDisabled: {
    opacity: 0.6,
    justifyContent: "center",
    paddingLeft: 7,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  arrowButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
  },
});