import axios from "axios";

type PincodeResult = {
  city: string;
  state: string;
  country: string;
};

export const getAddressFromPincode = async (
  pin: string
): Promise<PincodeResult | null> => {
  if (pin.length !== 6) return null;

  try {
    const res = await axios.get(
      `https://api.postalpincode.in/pincode/${pin}`
    );

    const data = res.data;

    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0];

      return {
        city: postOffice.District,
        state: postOffice.State,
        country: "India",
      };
    }

    return null;
  } catch (err) {
    console.log("Pincode fetch error:", err);
    return null;
  }
};