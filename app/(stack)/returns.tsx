import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { normalize } from "@/utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import api from "@/utils/config";

/* ---------- TYPES ---------- */

type Item = {
  _id: string;
  productId?: string;
  title: string;
  mainImage: string;
  quantity: number;
  variant?: string;
  price?: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  orderStatus: string; // ✅ important
  items: Item[];
};

/* ---------- ACTIONS ---------- */
const SIZES = [ "S", "M", "L", "XL", "XXL"];
const ACTIONS = [
  { label: "Return", value: "refund" },
  { label: "Exchange", value: "exchange" },
  { label: "Repair", value: "repair" },
];

/* ---------- REASONS ---------- */

const RETURN_REASONS = [
  "Item damaged or defective",
  "Wrong item received",
  "Quality not as expected",
  "Changed my mind",
];

const EXCHANGE_REASONS = [
  "Size doesn't fit",
  "Wrong item received",
  "Damaged item",
];

const REPAIR_REASONS = [
  "Stitch issue",
  "Print damage",
  "Fabric defect",
];

const getReasons = (action: string) => {
  if (action === "exchange") return EXCHANGE_REASONS;
  if (action === "repair") return REPAIR_REASONS;
  return RETURN_REASONS;
};

/* ---------- COMPONENT ---------- */

export default function ReturnExchangeScreen() {
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [selected, setSelected] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [openReason, setOpenReason] = useState<string | null>(null);

  /* ---------- RULE ---------- */
  const isReturnAllowed = order?.orderStatus === "delivered";

  /* ---------- FETCH ORDER ---------- */

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders/track", {
        params: { orderNumber, email },
      });
      setOrder(res.data.order);
      setStep(2);
    } catch {
      Toast.show({ type: "error", text1: "Order not found" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- TOGGLE ITEM ---------- */

  const toggleItem = (item: Item) => {
    if (!isReturnAllowed) return;

    setSelected((prev) => {
      if (prev[item._id]) {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      }
      return {
        ...prev,
        [item._id]: {
          action: "refund",
          reason: "",
          note: "",
          images: [],
        },
      };
    });
  };

  /* ---------- IMAGE PICK ---------- */

  const pickImage = async (itemId: string) => {
    if (!isReturnAllowed) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uris = result.assets.map((a) => a.uri);

      setSelected((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          images: [...(prev[itemId]?.images || []), ...uris],
        },
      }));
    }
  };

  /* ---------- SUBMIT ---------- */

  const submit = async () => {
    if (!order || !isReturnAllowed) return;

    try {
      setLoading(true);


const exchangeWithoutSize = Object.keys(selected).find(
  (itemId) =>
    selected[itemId]?.action === "exchange" &&
    !selected[itemId]?.exchangeSize
);

if (exchangeWithoutSize) {
  Toast.show({
    type: "error",
    text1: "Select exchange size",
    text2: "Please select a new size for the exchange.",
  });

  return;
}

      const perItemUploaded: Record<string, string[]> = {};
      const itemIds = Object.keys(selected);

      for (const itemId of itemIds) {
        perItemUploaded[itemId] = [];

        for (const uri of selected[itemId].images || []) {
          const fd = new FormData();

          fd.append("file", {
            uri,
            name: "image.jpg",
            type: "image/jpeg",
          } as any);

          const res = await api.post("/api/upload/image", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (res?.data?.url) perItemUploaded[itemId].push(res.data.url);
        }
      }

      const items = itemIds.map((itemId) => {
        const it = order.items.find((i) => i._id === itemId)!;

        return {
          orderItemId: itemId,
          productId: it.productId || itemId,
          qty: 1,
          action: selected[itemId].action,
          reason: selected[itemId].reason,
          details: selected[itemId].note,
          exchangeSize: selected[itemId].exchangeSize || null,
          photos: perItemUploaded[itemId],
          title: it.title,
          variant: it.variant,
          price: it.price || 0,
        };
      });

      await api.post("/api/returns", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        guestEmail: email || null,
        items,
      });

      Toast.show({ type: "success", text1: "Request Submitted" });
      setStep(3);
    } catch {
      Toast.show({ type: "error", text1: "Failed" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
return (
  <SafeAreaView style={styles.safe}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.hero}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrow}>GARRIB CARE</Text>
        </View>

        <Text style={styles.header}>RETURNS &{"\n"}EXCHANGES</Text>

        <Text style={styles.subHeader}>
          Simple, transparent and designed around you.
        </Text>

        <View style={styles.stepRow}>
          {[1, 2, 3].map((value) => (
            <React.Fragment key={value}>
              <View
                style={[
                  styles.stepCircle,
                  step >= value && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    step >= value && styles.stepNumberActive,
                  ]}
                >
                  {value}
                </Text>
              </View>

              {value < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    step > value && styles.stepLineActive,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>FIND ORDER</Text>
          <Text style={styles.stepLabel}>SELECT ITEMS</Text>
          <Text style={styles.stepLabel}>COMPLETE</Text>
        </View>
      </View>

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>

            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitle}>FIND YOUR ORDER</Text>
              <Text style={styles.sectionDescription}>
                Enter the details used when placing your order.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.inputLabel}>ORDER NUMBER</Text>

              <TextInput
                placeholder="e.g. GRB-102938"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                value={orderNumber}
                onChangeText={setOrderNumber}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>

              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                loading && styles.primaryBtnDisabled,
              ]}
              onPress={fetchOrder}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#111111" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>FIND MY ORDER</Text>

                  <View style={styles.buttonArrow}>
                    <Text style={styles.buttonArrowText}>→</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.helpCard}>
            <View style={styles.helpIcon}>
              <Text style={styles.helpIconText}>?</Text>
            </View>

            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>NEED HELP?</Text>
              <Text style={styles.helpText}>
                Your order number can be found in your order confirmation email.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* STEP 2 */}
      {step === 2 && order && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>

            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitle}>SELECT ITEMS</Text>
              <Text style={styles.sectionDescription}>
                Choose the pieces you want to return, exchange or repair.
              </Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View>
              <Text style={styles.orderInfoLabel}>ORDER</Text>
              <Text style={styles.orderInfoValue}>{order.orderNumber}</Text>
            </View>

            <View
              style={[
                styles.statusPill,
                isReturnAllowed
                  ? styles.statusPillActive
                  : styles.statusPillInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isReturnAllowed
                    ? styles.statusDotActive
                    : styles.statusDotInactive,
                ]}
              />

              <Text style={styles.statusText}>
                {order.orderStatus?.toUpperCase()}
              </Text>
            </View>
          </View>

          {!isReturnAllowed && (
            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>!</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>RETURN UNAVAILABLE</Text>
                <Text style={styles.infoText}>
                  Returns and exchanges become available once your order has
                  been delivered.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.itemsList}>
            {order.items.map((item, index) => {
              const active = !!selected[item._id];

              return (
                <View
                  key={item._id}
                  style={[
                    styles.productCard,
                    active && styles.productCardActive,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleItem(item)}
                    activeOpacity={0.85}
                    style={[
                      styles.productRow,
                      !isReturnAllowed && styles.productDisabled,
                    ]}
                  >
                    <View style={styles.productImageWrap}>
                      <Image
                        source={{ uri: item.mainImage }}
                        style={styles.img}
                      />

                      <View style={styles.itemIndex}>
                        <Text style={styles.itemIndexText}>
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.productContent}>
                      <Text style={styles.productTag}>GARRIB</Text>

                      <Text style={styles.title} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.meta}>
                          QTY {item.quantity}
                        </Text>

                        {!!item.variant && (
                          <>
                            <View style={styles.metaDot} />
                            <Text style={styles.meta}>
                              {item.variant.toUpperCase()}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        active && styles.checkboxActive,
                      ]}
                    >
                      {active && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  {active && isReturnAllowed && (
                    <View style={styles.returnForm}>
                      <View style={styles.divider} />

                      {/* ACTION */}
                      <View style={styles.formSection}>
                        <View style={styles.formTitleRow}>
                          <Text style={styles.formNumber}>01</Text>
                          <Text style={styles.label}>CHOOSE ACTION</Text>
                        </View>

                        <View style={styles.actionGrid}>
                          {ACTIONS.map((a) => {
                            const act =
                              selected[item._id].action === a.value;

                            return (
                              <TouchableOpacity
                                key={a.value}
                                activeOpacity={0.8}
                                style={[
                                  styles.chip,
                                  act && styles.chipActive,
                                ]}
                              

onPress={() =>
  setSelected((p) => ({
    ...p,
    [item._id]: {
      ...p[item._id],
      action: a.value,
      reason: "",
      exchangeSize:
        a.value === "exchange"
          ? p[item._id]?.exchangeSize || ""
          : null,
    },
  }))
}
                              >
                                <View
                                  style={[
                                    styles.chipRadio,
                                    act && styles.chipRadioActive,
                                  ]}
                                >
                                  {act && (
                                    <View style={styles.chipRadioFill} />
                                  )}
                                </View>

                                <Text
                                  style={[
                                    styles.chipText,
                                    act && styles.chipTextActive,
                                  ]}
                                >
                                  {a.label.toUpperCase()}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* REASON */}
                      <View style={styles.formSection}>
                        <View style={styles.formTitleRow}>
                          <Text style={styles.formNumber}>02</Text>
                          <Text style={styles.label}>SELECT REASON</Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.dropdown,
                            openReason === item._id &&
                              styles.dropdownActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() =>
                            setOpenReason(
                              openReason === item._id
                                ? null
                                : item._id
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              !selected[item._id].reason &&
                                styles.dropdownPlaceholder,
                            ]}
                            numberOfLines={1}
                          >
                            {selected[item._id].reason ||
                              "Select a reason"}
                          </Text>

                          <View
                            style={[
                              styles.dropdownArrow,
                              openReason === item._id &&
                                styles.dropdownArrowOpen,
                            ]}
                          >
                            <Text style={styles.dropdownArrowText}>⌄</Text>
                          </View>
                        </TouchableOpacity>

                        {openReason === item._id && (
                          <View style={styles.dropdownList}>
                            {getReasons(
                              selected[item._id].action
                            ).map((r, reasonIndex, reasons) => (
                              <TouchableOpacity
                                key={r}
                                activeOpacity={0.7}
                                style={[
                                  styles.dropdownItem,
                                  reasonIndex ===
                                    reasons.length - 1 &&
                                    styles.dropdownItemLast,
                                ]}
                                onPress={() => {
                                  setSelected((p) => ({
                                    ...p,
                                    [item._id]: {
                                      ...p[item._id],
                                      reason: r,
                                    },
                                  }));

                                  setOpenReason(null);
                                }}
                              >
                                <Text style={styles.dropdownItemText}>
                                  {r}
                                </Text>

                                <Text style={styles.dropdownItemArrow}>
                                  →
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* NOTE */}
                      <View style={styles.formSection}>
                        <View style={styles.formTitleRow}>
                          <Text style={styles.formNumber}>03</Text>
                          <Text style={styles.label}>
                            ADD DETAILS
                          </Text>

                          <Text style={styles.optional}>
                            OPTIONAL
                          </Text>
                        </View>

                        <TextInput
                          placeholder="Tell us more about the issue..."
                          placeholderTextColor="#A3A3A3"
                          style={styles.textArea}
                          multiline
                          textAlignVertical="top"
                          maxLength={500}
                          value={selected[item._id]?.note || ""}
                          onChangeText={(t) =>
                            setSelected((p) => ({
                              ...p,
                              [item._id]: {
                                ...p[item._id],
                                note: t,
                              },
                            }))
                          }
                        />

                        <Text style={styles.characterCount}>
                          {(selected[item._id]?.note || "").length}/500
                        </Text>
                      </View>
{/* EXCHANGE SIZE */}
{selected[item._id]?.action === "exchange" && (
  <View style={styles.formSection}>
    <View style={styles.formTitleRow}>
      <Text style={styles.formNumber}>03</Text>
      <Text style={styles.label}>SELECT NEW SIZE</Text>
    </View>

    <View style={styles.sizeGrid}>
      {SIZES.map((size) => {
        const selectedSize =
          selected[item._id]?.exchangeSize === size;

        return (
          <TouchableOpacity
            key={size}
            activeOpacity={0.8}
            style={[
              styles.sizeButton,
              selectedSize && styles.sizeButtonActive,
            ]}
            onPress={() =>
              setSelected((prev) => ({
                ...prev,
                [item._id]: {
                  ...prev[item._id],
                  exchangeSize: size,
                },
              }))
            }
          >
            <Text
              style={[
                styles.sizeButtonText,
                selectedSize && styles.sizeButtonTextActive,
              ]}
            >
              {size}
            </Text>

            {selectedSize && (
              <View style={styles.sizeSelectedDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
)}
                      {/* IMAGE */}
                      <View style={styles.formSection}>
                        <View style={styles.formTitleRow}>
                          <Text style={styles.formNumber}>04</Text>
                          <Text style={styles.label}>
                            ADD PHOTOS
                          </Text>

                          <Text style={styles.optional}>
                            OPTIONAL
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.upload}
                          activeOpacity={0.8}
                          onPress={() => pickImage(item._id)}
                        >
                          <View style={styles.uploadIcon}>
                            <Text style={styles.uploadIconText}>＋</Text>
                          </View>

                          <View style={styles.uploadContent}>
                            <Text style={styles.uploadTitle}>
                              UPLOAD PHOTOS
                            </Text>

                            <Text style={styles.uploadText}>
                              Add images to help us understand the issue.
                            </Text>
                          </View>

                          <Text style={styles.uploadArrow}>→</Text>
                        </TouchableOpacity>

                        {(selected[item._id]?.images || []).length >
                          0 && (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={
                              styles.previewContainer
                            }
                          >
                            {(
                              selected[item._id]?.images || []
                            ).map((img: string, i: number) => (
                              <View
                                key={`${img}-${i}`}
                                style={styles.previewWrap}
                              >
                                <Image
                                  source={{ uri: img }}
                                  style={styles.previewImg}
                                />

                                <View style={styles.previewNumber}>
                                  <Text
                                    style={styles.previewNumberText}
                                  >
                                    {i + 1}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!isReturnAllowed ||
                Object.keys(selected).length === 0 ||
                loading) &&
                styles.submitBtnDisabled,
            ]}
            disabled={
              !isReturnAllowed ||
              Object.keys(selected).length === 0 ||
              loading
            }
            onPress={submit}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <>
                <View>
                  <Text style={styles.submitBtnText}>
                    SUBMIT REQUEST
                  </Text>

                  <Text style={styles.submitBtnSubtext}>
                    {Object.keys(selected).length}{" "}
                    {Object.keys(selected).length === 1
                      ? "ITEM"
                      : "ITEMS"}{" "}
                    SELECTED
                  </Text>
                </View>

                <View style={styles.submitArrow}>
                  <Text style={styles.submitArrowText}>→</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <View style={styles.successContainer}>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>✓</Text>
          </View>

          <Text style={styles.successEyebrow}>
            REQUEST RECEIVED
          </Text>

          <Text style={styles.success}>
            YOU'RE{"\n"}ALL SET.
          </Text>

          <Text style={styles.successDescription}>
            Your request has been submitted successfully. We'll review
            the details and keep you updated by email.
          </Text>

          <View style={styles.successLine} />

          <Text style={styles.successFooter}>
            THANK YOU FOR SHOPPING WITH GARRIB
          </Text>
        </View>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  </SafeAreaView>
);
}
/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  scroll: {
    flex: 1,
  },

  container: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  hero: {
    paddingTop: 10,
    paddingBottom: 30,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B6FF2E",
  },

  eyebrow: {
    color: "#777777",
    fontSize: normalize(11),
    fontWeight: "800",
    letterSpacing: 2,
  },

  header: {
    color: "#111111",
    fontSize: normalize(42),
    lineHeight: normalize(43),
    fontWeight: "900",
    letterSpacing: -1.8,
  },

  subHeader: {
    maxWidth: 340,
    color: "#777777",
    fontSize: normalize(14),
    lineHeight: normalize(21),
    fontWeight: "500",
    marginTop: 12,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },

  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleActive: {
    backgroundColor: "#111111",
  },

  stepNumber: {
    color: "#999999",
    fontSize: normalize(11),
    fontWeight: "800",
  },

  stepNumberActive: {
    color: "#B6FF2E",
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E5E5",
  },

  stepLineActive: {
    backgroundColor: "#111111",
  },

  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  stepLabel: {
    color: "#999999",
    fontSize: normalize(8),
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  section: {
    width: "100%",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  sectionNumber: {
    color: "#B6FF2E",
    backgroundColor: "#111111",
    fontSize: normalize(11),
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    color: "#111111",
    fontSize: normalize(20),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  sectionDescription: {
    color: "#777777",
    fontSize: normalize(12),
    lineHeight: normalize(18),
    marginTop: 4,
    maxWidth: 400,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  field: {
    marginBottom: 16,
  },

  inputLabel: {
    color: "#111111",
    fontSize: normalize(10),
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 16,
    paddingHorizontal: 16,
    color: "#111111",
    fontSize: normalize(15),
    fontWeight: "600",
  },

  primaryBtn: {
    width: "100%",
    minHeight: 58,
    backgroundColor: "#B6FF2E",
    borderRadius: 18,
    paddingLeft: 20,
    paddingRight: 8,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  primaryBtnDisabled: {
    opacity: 0.6,
  },

  primaryBtnText: {
    color: "#111111",
    fontSize: normalize(12),
    fontWeight: "900",
    letterSpacing: 1,
  },

  buttonArrow: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonArrowText: {
    color: "#B6FF2E",
    fontSize: normalize(21),
    fontWeight: "500",
  },

  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
  },

  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  helpIconText: {
    color: "#111111",
    fontSize: normalize(14),
    fontWeight: "900",
  },

  helpContent: {
    flex: 1,
  },

  helpTitle: {
    color: "#111111",
    fontSize: normalize(10),
    fontWeight: "900",
    letterSpacing: 1,
  },

  helpText: {
    color: "#777777",
    fontSize: normalize(11),
    lineHeight: normalize(16),
    marginTop: 3,
  },

  orderInfo: {
    backgroundColor: "#111111",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderInfoLabel: {
    color: "#999999",
    fontSize: normalize(9),
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  orderInfoValue: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "800",
    marginTop: 4,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusPillActive: {
    backgroundColor: "#B6FF2E",
  },

  statusPillInactive: {
    backgroundColor: "#FFFFFF",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusDotActive: {
    backgroundColor: "#111111",
  },

  statusDotInactive: {
    backgroundColor: "#999999",
  },

  statusText: {
    color: "#111111",
    fontSize: normalize(9),
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  infoBox: {
    backgroundColor: "#FFF1F1",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoIconText: {
    color: "#FFFFFF",
    fontSize: normalize(12),
    fontWeight: "900",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#111111",
    fontSize: normalize(10),
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  infoText: {
    color: "#777777",
    fontSize: normalize(11),
    lineHeight: normalize(16),
    marginTop: 3,
  },

  itemsList: {
    gap: 14,
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    overflow: "hidden",
  },

  productCardActive: {
    borderColor: "#111111",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  productDisabled: {
    opacity: 0.4,
  },

  productImageWrap: {
    position: "relative",
  },

  img: {
    width: 82,
    height: 100,
    borderRadius: 17,
    backgroundColor: "#F5F5F5",
  },

  itemIndex: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: "#111111",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  itemIndexText: {
    color: "#B6FF2E",
    fontSize: normalize(8),
    fontWeight: "900",
  },

  productContent: {
    flex: 1,
    paddingHorizontal: 14,
  },

  productTag: {
    color: "#999999",
    fontSize: normalize(8),
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 5,
  },

  title: {
    color: "#111111",
    fontSize: normalize(14),
    lineHeight: normalize(19),
    fontWeight: "800",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  meta: {
    color: "#777777",
    fontSize: normalize(9),
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#B6FF2E",
    marginHorizontal: 7,
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#DADADA",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: "#B6FF2E",
    borderColor: "#B6FF2E",
  },

  checkmark: {
    color: "#111111",
    fontSize: normalize(15),
    fontWeight: "900",
  },

  returnForm: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 18,
  },

  formSection: {
    marginBottom: 20,
  },

  formTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  formNumber: {
    color: "#999999",
    fontSize: normalize(9),
    fontWeight: "900",
    marginRight: 7,
  },

  label: {
    color: "#111111",
    fontSize: normalize(10),
    fontWeight: "900",
    letterSpacing: 1,
  },

  optional: {
    marginLeft: "auto",
    color: "#AAAAAA",
    fontSize: normalize(8),
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    minWidth: 92,
    flexGrow: 1,
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  chipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  chipRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#BBBBBB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  chipRadioActive: {
    borderColor: "#B6FF2E",
  },

  chipRadioFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B6FF2E",
  },

  chipText: {
    color: "#555555",
    fontSize: normalize(9),
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  dropdown: {
    minHeight: 54,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownActive: {
    borderColor: "#111111",
  },

  dropdownText: {
    flex: 1,
    color: "#111111",
    fontSize: normalize(13),
    fontWeight: "600",
  },

  dropdownPlaceholder: {
    color: "#999999",
    fontWeight: "500",
  },

  dropdownArrow: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },

  dropdownArrowText: {
    color: "#111111",
    fontSize: normalize(15),
    fontWeight: "800",
  },

  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 15,
    marginTop: 7,
    overflow: "hidden",
  },

  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  dropdownItemLast: {
    borderBottomWidth: 0,
  },

  dropdownItemText: {
    flex: 1,
    color: "#333333",
    fontSize: normalize(12),
    fontWeight: "500",
    paddingRight: 10,
  },

  dropdownItemArrow: {
    color: "#999999",
    fontSize: normalize(14),
  },

  textArea: {
    minHeight: 110,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 16,
    padding: 14,
    paddingTop: 14,
    color: "#111111",
    fontSize: normalize(13),
    lineHeight: normalize(20),
  },

  characterCount: {
    color: "#AAAAAA",
    fontSize: normalize(9),
    textAlign: "right",
    marginTop: 5,
  },

  upload: {
    minHeight: 74,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CCCCCC",
    borderRadius: 17,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#B6FF2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  uploadIconText: {
    color: "#111111",
    fontSize: normalize(21),
    fontWeight: "500",
  },

  uploadContent: {
    flex: 1,
  },

  uploadTitle: {
    color: "#111111",
    fontSize: normalize(10),
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  uploadText: {
    color: "#888888",
    fontSize: normalize(10),
    lineHeight: normalize(14),
    marginTop: 3,
  },

  uploadArrow: {
    color: "#111111",
    fontSize: normalize(18),
    marginLeft: 6,
  },
// Add to StyleSheet.create({ ... })

sizeGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

sizeButton: {
  minWidth: 54,
  height: 50,
  paddingHorizontal: 15,
  borderRadius: 14,
  backgroundColor: "#F5F5F5",
  borderWidth: 1,
  borderColor: "#E8E8E8",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
},

sizeButtonActive: {
  backgroundColor: "#111111",
  borderColor: "#111111",
},

sizeButtonText: {
  color: "#555555",
  fontSize: normalize(12),
  fontWeight: "900",
},

sizeButtonTextActive: {
  color: "#B6FF2E",
},

sizeSelectedDot: {
  position: "absolute",
  top: 5,
  right: 5,
  width: 5,
  height: 5,
  borderRadius: 3,
  backgroundColor: "#B6FF2E",
},
  previewContainer: {
    paddingTop: 12,
    paddingRight: 8,
  },

  previewWrap: {
    position: "relative",
    marginRight: 9,
  },

  previewImg: {
    width: 78,
    height: 88,
    borderRadius: 14,
    backgroundColor: "#EEEEEE",
  },

  previewNumber: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  previewNumberText: {
    color: "#B6FF2E",
    fontSize: normalize(8),
    fontWeight: "900",
  },

  submitBtn: {
    minHeight: 68,
    backgroundColor: "#B6FF2E",
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 10,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  submitBtnDisabled: {
    opacity: 0.4,
  },

  submitBtnText: {
    color: "#111111",
    fontSize: normalize(13),
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  submitBtnSubtext: {
    color: "#555555",
    fontSize: normalize(8),
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 3,
  },

  submitArrow: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  submitArrowText: {
    color: "#B6FF2E",
    fontSize: normalize(22),
  },

  successContainer: {
    backgroundColor: "#111111",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 38,
    alignItems: "center",
    marginTop: 10,
  },

  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#B6FF2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  successBadgeText: {
    color: "#111111",
    fontSize: normalize(28),
    fontWeight: "900",
  },

  successEyebrow: {
    color: "#B6FF2E",
    fontSize: normalize(9),
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
  },

  success: {
    color: "#FFFFFF",
    fontSize: normalize(42),
    lineHeight: normalize(42),
    fontWeight: "900",
    letterSpacing: -1.5,
    textAlign: "center",
  },

  successDescription: {
    maxWidth: 340,
    color: "#999999",
    fontSize: normalize(12),
    lineHeight: normalize(19),
    textAlign: "center",
    marginTop: 16,
  },

  successLine: {
    width: 40,
    height: 3,
    backgroundColor: "#B6FF2E",
    borderRadius: 2,
    marginVertical: 24,
  },

  successFooter: {
    color: "#777777",
    fontSize: normalize(8),
    fontWeight: "800",
    letterSpacing: 1.4,
    textAlign: "center",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  bottomSpace: {
    height: 50,
  },
});