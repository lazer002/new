import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "@/context/FilterContext";
import { SCREEN, hp, normalize } from "@/utils/responsive";

type Screen =
  | "main"
  | "category"
  | "size"
  | "color"
  | "price"
  | "sale"
  | "stock"
  | "new";

type Props = {
  visible: boolean;
  categories: any[];
  onClose: () => void;
};

export default function BottomFilterSheet({
  visible,
  categories,
  onClose,
}: Props) {
  const { filters, setFilters, resetFilters, activeCount } = useFilter();
  const [screen, setScreen] = useState<Screen>("main");

  const translateY = useSharedValue(SCREEN.height);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : SCREEN.height, {
      duration: visible ? 380 : 260,
    });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
      {/* ───────── HANDLE ───────── */}

<View style={styles.handle} />

{/* ───────── HEADER ───────── */}

<View style={styles.header}>

  <Pressable
    onPress={() =>
      screen === "main"
        ? onClose()
        : setScreen("main")
    }
    style={styles.circleBtn}
  >

    <Ionicons
      name={
        screen === "main"
          ? "close"
          : "chevron-back"
      }
      size={22}
      color="#111"
    />

  </Pressable>

  <View style={{ flex: 1 }}>

    <Text style={styles.headerTitle}>
      Filters
    </Text>

    <Text style={styles.headerSub}>
      {activeCount} Active Filters
    </Text>

  </View>

  <View style={styles.resultBadge}>

    <Text style={styles.resultText}>
      {activeCount > 0
        ? "READY"
        : "ALL"}
    </Text>

  </View>

</View>

        {/* Body */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* MAIN */}
          {screen === "main" && (
            <>
              <MainRow
                label="Category"
                value={
                  categories.find((c) => c._id === filters.category)?.name
                }
                active={!!filters.category}
                onPress={() => setScreen("category")}
              />

              <MainRow
                label="Size"
                value={filters.sizes.join(", ")}
                active={filters.sizes.length > 0}
                onPress={() => setScreen("size")}
              />

              <MainRow
                label="Color"
                value={filters.colors.join(", ")}
                active={filters.colors.length > 0}
                onPress={() => setScreen("color")}
              />

              <MainRow
                label="Price"
                value={
                  filters.price
                    ? `₹${filters.price.min} – ₹${filters.price.max}`
                    : undefined
                }
                active={!!filters.price}
                onPress={() => setScreen("price")}
              />

              <MainRow
                label="On Sale"
                value={filters.onSale ? "Yes" : undefined}
                active={filters.onSale}
                onPress={() => setScreen("sale")}
              />

              <MainRow
                label="In Stock"
                value={filters.inStockOnly ? "Only" : undefined}
                active={filters.inStockOnly}
                onPress={() => setScreen("stock")}
              />

              <MainRow
                label="New Arrivals"
                value={filters.isNewProduct ? "Only" : undefined}
                active={filters.isNewProduct}
                onPress={() => setScreen("new")}
              />
            </>
          )}

          {/* CATEGORY */}
    {/* CATEGORY */}

{screen === "category" && (

  <>

    {categories.map((cat) => {

      const active =
        filters.category === cat._id;

      return (

        <Pressable
          key={cat._id}
          style={[
            styles.categoryCard,
            active &&
              styles.categoryCardActive,
          ]}
          onPress={() => {

            setFilters((f) => ({
              ...f,
              category: cat._id,
            }));

            setScreen("main");

          }}
        >

          <View style={styles.categoryLeft}>

            <View
              style={[
                styles.categoryIcon,
                active &&
                  styles.categoryIconActive,
              ]}
            >

              <Ionicons
                name="shirt-outline"
                size={20}
                color={
                  active
                    ? "#111"
                    : "#666"
                }
              />

            </View>

            <Text
              style={[
                styles.categoryName,
                active &&
                  styles.categoryNameActive,
              ]}
            >
              {cat.name}
            </Text>

          </View>

          {active && (

            <View
              style={styles.selectedBadge}
            >

              <Ionicons
                name="checkmark"
                size={18}
                color="#111"
              />

            </View>

          )}

        </Pressable>

      );

    })}

  </>

)}

          {/* SIZE */}
       {/* SIZE */}

{screen === "size" && (

<View style={styles.sizeGrid}>

  {["XS","S","M","L","XL","XXL"].map((size)=>{

    const active =
      filters.sizes.includes(size);

    return(

      <Pressable
        key={size}
        style={[
          styles.sizeChip,
          active &&
            styles.sizeChipActive,
        ]}
        onPress={()=>{

          setFilters((f)=>({

            ...f,

            sizes: active
              ? f.sizes.filter(
                  (x)=>x!==size
                )
              : [
                  ...f.sizes,
                  size,
                ],

          }));

        }}
      >

        <Text
          style={[
            styles.sizeText,
            active &&
              styles.sizeTextActive,
          ]}
        >
          {size}
        </Text>

      </Pressable>

    );

  })}

</View>

)}

          {/* COLOR */}
      {/* COLOR */}

{screen === "color" && (

<View style={styles.colorGrid}>

  {[
    {name:"Black",color:"#111"},
    {name:"White",color:"#FFF"},
    {name:"Red",color:"#FF4B4B"},
    {name:"Blue",color:"#3578FF"},
    {name:"Green",color:"#65D66E"},
    {name:"Brown",color:"#8B5A2B"},
    {name:"Grey",color:"#9E9E9E"},
    {name:"Beige",color:"#D7C5A4"},
  ].map((item)=>{

    const active =
      filters.colors.includes(item.name);

    return(

      <Pressable
        key={item.name}
        style={styles.colorCard}
        onPress={()=>{

          setFilters((f)=>({

            ...f,

            colors: active
              ? f.colors.filter(
                  (x)=>x!==item.name
                )
              : [
                  ...f.colors,
                  item.name,
                ],

          }));

        }}
      >

        <View
          style={[
            styles.colorCircle,
            {
              backgroundColor:item.color,
              borderWidth:
                item.name==="White"
                  ?1
                  :0,
            },
            active &&
              styles.colorCircleActive,
          ]}
        />

        <Text
          style={styles.colorName}
        >
          {item.name}
        </Text>

        {active && (

          <View
            style={styles.colorTick}
          >

            <Ionicons
              name="checkmark"
              size={14}
              color="#111"
            />

          </View>

        )}

      </Pressable>

    );

  })}

</View>

)}

          {/* PRICE */}
      {/* PRICE */}

{screen === "price" && (

<View style={styles.priceGrid}>

  {[
    {
      title:"Budget",
      max:499,
      subtitle:"Under ₹499",
    },
    {
      title:"Value",
      max:999,
      subtitle:"Under ₹999",
    },
    {
      title:"Premium",
      max:1499,
      subtitle:"Under ₹1499",
    },
    {
      title:"Luxury",
      max:1999,
      subtitle:"Under ₹1999",
    },
    {
      title:"Elite",
      max:2499,
      subtitle:"Under ₹2499",
    },
    {
      title:"Unlimited",
      max:99999,
      subtitle:"All Prices",
    },
  ].map((item)=>{

    const active =
      filters.price?.max === item.max;

    return(

      <Pressable
        key={item.max}
        style={[
          styles.priceCard,
          active &&
            styles.priceCardActive,
        ]}
        onPress={()=>{

          setFilters((f)=>({

            ...f,

            price:{
              min:0,
              max:item.max,
            },

          }));

        }}
      >

        <Ionicons
          name="wallet-outline"
          size={28}
          color={
            active
              ? "#111"
              : "#666"
          }
        />

        <Text
          style={[
            styles.priceTitle,
            active &&
              styles.priceTitleActive,
          ]}
        >
          {item.title}
        </Text>

        <Text
          style={[
            styles.priceSubtitle,
            active &&
              styles.priceSubtitleActive,
          ]}
        >
          {item.subtitle}
        </Text>

      </Pressable>

    );

  })}

</View>

)}

          {/* SALE */}
  {/* SALE */}

{screen === "sale" && (

<Pressable
  style={[
    styles.toggleCard,
    filters.onSale &&
      styles.toggleCardActive,
  ]}
  onPress={() =>
    setFilters((f)=>({
      ...f,
      onSale:!f.onSale,
    }))
  }
>

  <Ionicons
    name="flash"
    size={34}
    color={
      filters.onSale
        ? "#111"
        : "#666"
    }
  />

  <Text style={styles.toggleTitle}>
    Sale Items
  </Text>

  <Text style={styles.toggleSubtitle}>
    Show discounted products only
  </Text>

</Pressable>

)}

          {/* STOCK */}
      {/* STOCK */}

{screen === "stock" && (

<Pressable
  style={[
    styles.toggleCard,
    filters.inStockOnly &&
      styles.toggleCardActive,
  ]}
  onPress={() =>
    setFilters((f)=>({
      ...f,
      inStockOnly:!f.inStockOnly,
    }))
  }
>

  <Ionicons
    name="cube"
    size={34}
    color={
      filters.inStockOnly
        ? "#111"
        : "#666"
    }
  />

  <Text style={styles.toggleTitle}>
    In Stock
  </Text>

  <Text style={styles.toggleSubtitle}>
    Hide sold out products
  </Text>

</Pressable>

)}

          {/* NEW */}
  {/* NEW */}

{screen === "new" && (

<Pressable
  style={[
    styles.toggleCard,
    filters.isNewProduct &&
      styles.toggleCardActive,
  ]}
  onPress={() =>
    setFilters((f)=>({
      ...f,
      isNewProduct:!f.isNewProduct,
    }))
  }
>

  <Ionicons
    name="sparkles"
    size={34}
    color={
      filters.isNewProduct
        ? "#111"
        : "#666"
    }
  />

  <Text style={styles.toggleTitle}>
    New Arrivals
  </Text>

  <Text style={styles.toggleSubtitle}>
    Latest collections only
  </Text>

</Pressable>

)}
        </ScrollView>

        {/* Footer */}
 {/* PREMIUM FOOTER */}

<View style={styles.footer}>

  <Pressable
    style={styles.resetButton}
    onPress={resetFilters}
  >

    <Ionicons
      name="refresh"
      size={20}
      color="#666"
    />

    <Text style={styles.resetText}>
      Reset
    </Text>

  </Pressable>

  <Pressable
    style={styles.applyButton}
    onPress={onClose}
  >

    <Text style={styles.applyButtonText}>

      Apply Filters

    </Text>

    <View style={styles.countBadge}>

      <Text style={styles.countText}>
        {activeCount}
      </Text>

    </View>

  </Pressable>

</View>
      </Animated.View>
    </>
  );
}

/* ───────────────── ROW COMPONENTS ───────────────── */

function MainRow({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value?: string;
  active: boolean;
  onPress: () => void;
}) {

  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    Category: "grid-outline",
    Size: "resize-outline",
    Color: "color-palette-outline",
    Price: "pricetag-outline",
    "On Sale": "flash-outline",
    "In Stock": "cube-outline",
    "New Arrivals": "sparkles-outline",
  };

  return (

    <Pressable
      style={[
        styles.filterCard,
        active && styles.filterCardActive,
      ]}
      onPress={onPress}
    >

      <View style={styles.filterLeft}>

        <View
          style={[
            styles.filterIcon,
            active &&
              styles.filterIconActive,
          ]}
        >

          <Ionicons
            name={icons[label]}
            size={21}
            color={
              active
                ? "#111"
                : "#666"
            }
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.filterTitle}>
            {label}
          </Text>

          {!!value && (

            <Text
              numberOfLines={1}
              style={styles.filterValue}
            >
              {value}
            </Text>

          )}

        </View>

      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >

        {active && (

          <View
            style={styles.activeDot}
          />

        )}

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#777"
        />

      </View>

    </Pressable>

  );

}
function ItemRow({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      <Text>{label}</Text>
      {active && <Ionicons name="checkmark" size={18} />}
    </Pressable>
  );
}

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    elevation: 16,

  },

  sheet: {
    position: "absolute",
    bottom: 0,
    height: hp(80),
    width: SCREEN.width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    
  },




  mainRow: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },

  mainLabel: {
    fontSize: normalize(15),
    fontWeight: "600",
  },

  mainValue: {
    fontSize: normalize(13),
    color: "#666",
    marginTop: 4,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
  },

  itemRow: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },



  clear: {
    fontWeight: "700",
  },

  applyBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  applyText: {
    color: "#fff",
    fontWeight: "800",
  },
  handle:{

  alignSelf:"center",

  width:54,

  height:5,

  borderRadius:3,

  backgroundColor:"#D8D8D8",

  marginBottom:22,

},

header:{

  flexDirection:"row",

  alignItems:"center",

  marginBottom:24,

},

circleBtn:{

  width:46,

  height:46,

  borderRadius:23,

  backgroundColor:"#F5F5F5",

  justifyContent:"center",

  alignItems:"center",

  marginRight:16,

},

headerTitle:{

  fontSize:normalize(28),

  fontWeight:"900",

  color:"#111",

},

headerSub:{

  marginTop:3,

  fontSize:normalize(13),

  color:"#7A7A7A",

  fontWeight:"600",

},

resultBadge:{

  backgroundColor:"#B6FF2E",

  paddingHorizontal:16,

  height:36,

  borderRadius:18,

  justifyContent:"center",

},

resultText:{

  color:"#111",

  fontWeight:"900",

  fontSize:normalize(12),

  letterSpacing:1,

},
filterCard:{

  height:74,

  backgroundColor:"#F7F7F7",

  borderRadius:22,

  flexDirection:"row",

  alignItems:"center",

  justifyContent:"space-between",

  paddingHorizontal:18,

  marginBottom:14,

},

filterCardActive:{

  borderWidth:2,

  borderColor:"#B6FF2E",

},

filterLeft:{

  flexDirection:"row",

  alignItems:"center",

  flex:1,

},

filterIcon:{

  width:48,

  height:48,

  borderRadius:24,

  backgroundColor:"#FFF",

  justifyContent:"center",

  alignItems:"center",

  marginRight:16,

},

filterIconActive:{

  backgroundColor:"#B6FF2E",

},

filterTitle:{

  fontSize:normalize(17),

  fontWeight:"800",

  color:"#111",

},

filterValue:{

  marginTop:4,

  color:"#7A7A7A",

  fontSize:normalize(13),

},

activeDot:{

  width:9,

  height:9,

  borderRadius:5,

  backgroundColor:"#B6FF2E",

  marginRight:10,

},
categoryCard:{
  height:72,
  borderRadius:22,
  backgroundColor:"#F7F7F7",
  marginBottom:14,
  paddingHorizontal:18,
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"space-between",
},

categoryCardActive:{
  backgroundColor:"#111",
},

categoryLeft:{
  flexDirection:"row",
  alignItems:"center",
},

categoryIcon:{
  width:46,
  height:46,
  borderRadius:23,
  backgroundColor:"#FFF",
  justifyContent:"center",
  alignItems:"center",
  marginRight:16,
},

categoryIconActive:{
  backgroundColor:"#B6FF2E",
},

categoryName:{
  fontSize:normalize(17),
  fontWeight:"800",
  color:"#111",
},

categoryNameActive:{
  color:"#FFF",
},

selectedBadge:{
  width:34,
  height:34,
  borderRadius:17,
  backgroundColor:"#B6FF2E",
  justifyContent:"center",
  alignItems:"center",
},
sizeGrid:{

  flexDirection:"row",

  flexWrap:"wrap",

  justifyContent:"space-between",

},

sizeChip:{

  width:"31%",

  height:64,

  borderRadius:22,

  backgroundColor:"#F5F5F5",

  justifyContent:"center",

  alignItems:"center",

  marginBottom:16,

},

sizeChipActive:{

  backgroundColor:"#B6FF2E",

},

sizeText:{

  fontSize:normalize(22),

  fontWeight:"900",

  color:"#111",

},

sizeTextActive:{

  color:"#111",

},
colorGrid:{

  flexDirection:"row",

  flexWrap:"wrap",

  justifyContent:"space-between",

},

colorCard:{

  width:"48%",

  height:82,

  borderRadius:22,

  backgroundColor:"#F7F7F7",

  marginBottom:16,

  justifyContent:"center",

  alignItems:"center",

},

colorCircle:{

  width:34,

  height:34,

  borderRadius:17,

  borderColor:"#DDD",

},

colorCircleActive:{

  borderWidth:4,

  borderColor:"#B6FF2E",

},

colorName:{

  marginTop:10,

  fontWeight:"700",

  fontSize:normalize(14),

  color:"#111",

},

colorTick:{

  position:"absolute",

  top:10,

  right:10,

  width:24,

  height:24,

  borderRadius:12,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",

},
priceGrid:{

  flexDirection:"row",

  flexWrap:"wrap",

  justifyContent:"space-between",

},

priceCard:{

  width:"48%",

  height:140,

  borderRadius:24,

  backgroundColor:"#F7F7F7",

  justifyContent:"center",

  alignItems:"center",

  marginBottom:16,

},

priceCardActive:{

  backgroundColor:"#B6FF2E",

},

priceTitle:{

  marginTop:16,

  fontSize:normalize(18),

  fontWeight:"900",

  color:"#111",

},

priceSubtitle:{

  marginTop:6,

  fontSize:normalize(13),

  color:"#777",

},

priceTitleActive:{

  color:"#111",

},

priceSubtitleActive:{

  color:"#333",

},
toggleCard:{

  height:180,

  borderRadius:30,

  backgroundColor:"#F7F7F7",

  justifyContent:"center",

  alignItems:"center",

  paddingHorizontal:30,

},

toggleCardActive:{

  backgroundColor:"#B6FF2E",

},

toggleTitle:{

  marginTop:18,

  fontSize:normalize(24),

  fontWeight:"900",

  color:"#111",

},

toggleSubtitle:{

  marginTop:8,

  textAlign:"center",

  color:"#666",

  fontSize:normalize(15),

  lineHeight:normalize(22),

},
footer:{

  flexDirection:"row",

  alignItems:"center",

  paddingTop:18,

  paddingBottom:8,

},

resetButton:{

  width:64,

  height:64,

  borderRadius:22,

  backgroundColor:"#F5F5F5",

  justifyContent:"center",

  alignItems:"center",

},

resetText:{

  marginTop:3,

  fontSize:normalize(11),

  fontWeight:"700",

  color:"#666",

},

applyButton:{

  flex:1,

  height:64,

  marginLeft:14,

  borderRadius:22,

  backgroundColor:"#111",

  flexDirection:"row",

  alignItems:"center",

  justifyContent:"center",

},

applyButtonText:{

  color:"#FFF",

  fontSize:normalize(18),

  fontWeight:"900",

},

countBadge:{

  marginLeft:12,

  width:30,

  height:30,

  borderRadius:15,

  backgroundColor:"#B6FF2E",

  justifyContent:"center",

  alignItems:"center",

},

countText:{

  color:"#111",

  fontWeight:"900",

  fontSize:normalize(14),

},
});
