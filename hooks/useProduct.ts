import { useEffect, useState } from "react";
import api from "@/utils/config";

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.log("Product error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { product, loading };
};