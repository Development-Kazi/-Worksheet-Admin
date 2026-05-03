import moment from "moment";
import { APITemplate } from "./API/Template";

export const DateFormate = (isoDate) => {
  const humanReadableDate = moment(isoDate).format("DD MMM YYYY h:mmA");
  return humanReadableDate;
};

export const changeStatus = async (status, type, id) => {
  const response = await APITemplate(`admin/changeStatus`, "POST", {
    status,
    type,
    id,
  });
  return response;
};

export function IsoDateFormate(date) {
  return new Date(date).toISOString();
}

// export function getAdminData() {
//   const AdminData = Cookies.get("adminData");
//   // console.log(AdminData);
//   if (AdminData) {
//     try {
//       return JSON.parse(AdminData);
//     } catch (error) {
//       console.error("Failed to parse adminData:", error);
//       return null;
//     }
//   }
//   return null;
// }

export function checkpermission(access, department, section, value) {
  if (access) {
    const admin = access
      .filter((a) => a.slug == department)
      .map((a) => {
        let newSections = [...a.sections];
        let currentSection = newSections.filter((s) => s.slug == section);
        if (currentSection.length > 0) {
          return currentSection[0][value];
        } else {
          return false;
        }
      });
    if (admin.length > 0) {
      return admin[0];
    } else {
      return false;
    }
  }
}

export const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
};

// Accounts ------

export const calculateTotal = (quantity, rate, setTotal) => {
  const result = quantity * rate;
  if (!isFinite(result) || isNaN(result)) {
    setTotal(0);
  } else if (isFinite(result) || !isNaN(result)) {
    setTotal(result.toFixed(0));
  } else {
    setTotal(0);
  }
};

export const calculateRate = (total, quantity, setRate) => {
  const result = total / quantity;
  if (!isFinite(result) || isNaN(result)) {
    setRate(0);
  } else if (isFinite(result) || !isNaN(result)) {
    setRate(result.toFixed(4));
  } else {
    setTotal(0);
  }
};

export const calculateQuantity = (total, rate, setQuantity) => {
  const result = total / rate;
  if (!isFinite(result) || isNaN(result)) {
    console.log("infinite || nan =>", result);
    setQuantity(0);
  } else if (isFinite(result) || !isNaN(result)) {
    console.log("result=>", result);

    setQuantity(result.toFixed(2));
  } else {
    console.log("else=>", result);

    setTotal(0);
  }
};

export const handleQuantityChange = (
  e,
  first,
  second,
  total,
  rate,
  setQuantity,
  setFirst,
  setSecond,
  setTotal,
  setRate
) => {
  console.log(e.target.value, first, second);
  setQuantity(e.target.value);
  if (first === "none") {
    setFirst("quantity");
    if (second === "rate") {
      calculateTotal(e.target.value, rate, setTotal);
    } else if (second === "total" && first !== "quantity") {
      calculateRate(total, e.target.value, setRate);
    }
  } else if (second === "none" && first !== "quantity") {
    setSecond("quantity");
    if (first === "rate") {
      calculateTotal(e.target.value, rate, setTotal);
    } else if (first === "total") {
      calculateRate(total, e.target.value, setRate);
    }
  } else if (first === "total" && second === "quantity") {
    calculateRate(total, e.target.value, setRate);
  } else if (first === "quantity" && second === "total") {
    calculateRate(total, e.target.value, setRate);
  } else if (second !== "none") {
    calculateTotal(e.target.value, rate, setTotal);
  }
};

export const handleRateChange = (
  e,
  first,
  second,
  quantity,
  total,
  setRate,
  setFirst,
  setSecond,
  setTotal,
  setQuantity
) => {
  console.log(e.target.value, first, second);
  setRate(e.target.value);
  if (first === "none") {
    setFirst("rate");
    if (second === "quantity") {
      calculateTotal(quantity, e.target.value, setTotal);
    } else if (second === "total") {
      calculateQuantity(total, e.target.value, setQuantity);
    }
  } else if (second === "none" && first !== "rate") {
    setSecond("rate");
    if (first === "quantity") {
      calculateTotal(quantity, e.target.value, setTotal);
    } else if (first === "total") {
      calculateQuantity(total, e.target.value, setQuantity);
    }
  } else if (first === "total" && second === "rate") {
    calculateQuantity(total, e.target.value, setQuantity);
  } else if (first === "total" && second === "quantity") {
    calculateTotal(quantity, e.target.value, setTotal);
  } else if (first === "rate" && second === "total") {
    calculateQuantity(total, e.target.value, setQuantity);
  } else if (second !== "none") {
    calculateTotal(quantity, e.target.value, setTotal);
  }
};

export const handleTotalChange = (
  e,
  first,
  second,
  quantity,
  rate,
  setTotal,
  setFirst,
  setSecond,
  setRate,
  setQuantity
) => {
  console.log(e.target.value, first, second);

  setTotal(e.target.value);
  if (first === "none") {
    setFirst("total");
    if (second === "quantity") {
      calculateRate(e.target.value, quantity, setRate);
    } else if (second === "rate") {
      calculateQuantity(e.target.value, rate, setQuantity);
    }
  } else if (second === "none" && first !== "total") {
    setSecond("total");
    console.log("Second is set to total");
    if (first === "quantity") {
      calculateRate(e.target.value, quantity, setRate);
    } else if (first === "rate") {
      calculateQuantity(e.target.value, rate, setQuantity);
    }
  } else if (first === "total" && second === "quantity") {
    calculateRate(e.target.value, quantity, setRate);
  } else if (first === "rate" && second === "total") {
    calculateQuantity(e.target.value, rate, setQuantity);
  } else if (first === "total" && second === "rate") {
    calculateQuantity(e.target.value, rate, setQuantity);
  } else if (first === "quantity" && second === "total") {
    calculateRate(e.target.value, quantity, setRate);
  } else if (first === "quantity" && second === "rate") {
    calculateQuantity(e.target.value, rate, setQuantity);
  } else if (first === "rate" && second === "quantity") {
    calculateQuantity(e.target.value, rate, setQuantity);
  }
};

// KYC -----
export const calculateAmlAmount = (tokenType, amount, tokenCode) => {
  let convertedAmount;

  switch (tokenType) {
    case "TRX":
    case "BSC":
      convertedAmount = amount / 1000000;
      break;
    case "BTC":
      convertedAmount = amount / 100000000;
      break;
    case "ETH":
      convertedAmount =
        tokenCode === "ETH" ? amount / 1000000000 : amount / 1000000; // includes usdt, usdc and all other
      break;
    default:
      convertedAmount = amount;
  }

  return convertedAmount;
};
