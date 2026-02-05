// src/screens/ReturnScreen.js
import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Image
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReturnScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [order, setOrder] = useState(null);
  const [selected, setSelected] = useState({}); // { id: {reason} }

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const fetchOrder = async () => {
    if (!orderNumber || (!user && !email)) return;
    try {
      const res = await api.get(`/api/orders/track?email=${email}&orderNumber=${orderNumber}`);
      setOrder(res.data.order);
      next();
    } catch (err) {
      console.log("Order fetch error:", err);
    }
  };

  const toggleItem = (item) => {
    setSelected((prev) => {
      if (prev[item._id]) {
        let copy = { ...prev }; delete copy[item._id]; return copy;
      }
      return { ...prev, [item._id]: { reason: "" } };
    });
  };

  const submitReturn = () => {
    navigation.navigate("TrackOrder", { orderNumber, email });
  };

  const Progress = () => (
    <View style={styles.progressWrap}>
      {[1,2,3].map(i => (
        <View key={i} style={[
          styles.progressDot,
          { backgroundColor: step >= i ? "#111" : "#eee" }
        ]}/>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={{ flex:1, backgroundColor:"#fff", paddingTop: insets.top + 10 }}
      contentContainerStyle={{ padding:20 }}
    >
      <Text style={styles.header}>Return / Exchange</Text>
      <Progress />

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.block}>
          <Text style={styles.title}>Find your order</Text>
          <Text style={styles.help}>We’ll locate your order to start the return.</Text>

          {!user && (
            <TextInput
              placeholder="Email used for order"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
            />
          )}

          <TextInput
            placeholder="Order Number"
            value={orderNumber}
            onChangeText={setOrderNumber}
            style={styles.input}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={fetchOrder}>
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2 */}
      {step === 2 && order && (
        <View style={styles.block}>
          <Text style={styles.title}>Select items</Text>
          <Text style={styles.help}>Choose what you'd like to return or exchange.</Text>

          {order.items.map((item) => {
            const active = !!selected[item._id];
            return (
              <View key={item._id} style={styles.cardWrap}>
                <TouchableOpacity
                  onPress={() => toggleItem(item)}
                  style={[
                    styles.card,
                    active && { borderColor:"#111", backgroundColor:"#fafafa" }
                  ]}
                >
                  <Image source={{ uri: item.image }} style={styles.img}/>
                  <View style={{ flex:1 }}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.meta}>Qty: {item.qty} • Size: {item.size}</Text>
                  </View>
                </TouchableOpacity>

                {active && (
                  <TextInput
                    placeholder="Tell us the reason (optional)"
                    value={selected[item._id].reason}
                    onChangeText={(t) =>
                      setSelected((prev) => ({
                        ...prev,
                        [item._id]: { ...prev[item._id], reason: t }
                      }))
                    }
                    style={styles.reasonBox}
                    multiline
                  />
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { opacity: Object.keys(selected).length ? 1 : 0.35 }
            ]}
            disabled={!Object.keys(selected).length}
            onPress={next}
          >
            <Text style={styles.primaryText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <View style={styles.block}>
          <Text style={styles.title}>Confirm & Submit</Text>
          <Text style={styles.help}>Review your request before submitting.</Text>

          {Object.keys(selected).map((id) => {
            const item = order.items.find(i => i._id === id);
            return (
              <View key={id} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.img}/>
                <View style={{ flex:1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.meta}>
                    Reason: {selected[id].reason || "Not specified"}
                  </Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.primaryBtn} onPress={submitReturn}>
            <Text style={styles.primaryText}>Submit Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// STYLE
const styles = StyleSheet.create({
  header:{ fontSize:28, fontWeight:"900", marginBottom:16, color:"#111" },
  progressWrap:{ flexDirection:"row", gap:8, marginBottom:30 },
  progressDot:{ width:10, height:10, borderRadius:5 },
  block:{ marginBottom:40 },
  title:{ fontSize:22, fontWeight:"900", marginBottom:6, color:"#111" },
  help:{ fontSize:14, opacity:.55, marginBottom:14 },
  input:{
    borderWidth:1, borderColor:"#ddd", padding:14, borderRadius:14,
    marginTop:10, fontSize:15
  },
  primaryBtn:{
    backgroundColor:"#111", paddingVertical:15, borderRadius:14,
    marginTop:20, alignItems:"center"
  },
  primaryText:{ color:"#fff", fontSize:16, fontWeight:"800" },
  backBtn:{ marginTop:14, alignItems:"center" },
  backText:{ color:"#111", fontWeight:"700" },
  cardWrap:{ marginBottom:16 },
  card:{
    flexDirection:"row", padding:14, borderWidth:1, borderColor:"#eee",
    borderRadius:14, gap:12
  },
  img:{ width:70, height:90, borderRadius:12, backgroundColor:"#eee" },
  itemTitle:{ fontSize:15, fontWeight:"700", marginBottom:4, color:"#111" },
  meta:{ fontSize:13, opacity:0.6 },
  reasonBox:{
    borderWidth:1, borderColor:"#ddd", padding:12, borderRadius:12,
    marginTop:8, minHeight:65, fontSize:14
  }
});
