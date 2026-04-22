import { useEffect, useState } from "react";
import api from "@/utils/config";

export const useRelated = (product: any) => {
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!product) return;

    const currentCat =
      typeof product.category === "string"
        ? product.category
        : product.category?._id;

    if (!currentCat) return;

    (async () => {
      try {
        const res = await api.get("/api/products");
        const items = res.data.items || [];

        const filtered = items.filter((p: any) => {
          const itemCat =
            typeof p.category === "string"
              ? p.category
              : p.category?._id;

          return p._id !== product._id && currentCat === itemCat;
        });

        setRelated(filtered.slice(0, 8));
      } catch (e) {
        console.log("Related error", e);
      }
    })();
  }, [product]);

  return related;
};