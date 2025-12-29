import { CustomError } from "./errorHandler";

interface validateIpPayload {
  IP_ADDRESS_ID: number;
  IP_ADDRESS: string;
  EMAIL?: string | null;
  PHONE?: string | null;
  OTP_TYPE: string;
  CREATED_AT: string;
}

type ValidateIpReturnType = {
  last5Min: validateIpPayload[];
  last10Min: validateIpPayload[];
  last20Min: validateIpPayload[];
  last30Days: validateIpPayload[];
};

export const validateIp = (ipData: validateIpPayload[]): ValidateIpReturnType => {
  const now = new Date().getTime();

  // Convert string CREATED_AT → Date object for comparisons
  const parsedData = ipData.map((item) => ({
    ...item,
    createdAtDate: new Date(item.CREATED_AT).getTime(),
  }));

  const getLastMinutes = (minutes: number) => {
    const limit = now - minutes * 60 * 1000;
    return parsedData.filter((d) => d.createdAtDate >= limit);
  };

  const getLastDays = (days: number) => {
    const limit = now - days * 24 * 60 * 60 * 1000;
    return parsedData.filter((d) => d.createdAtDate >= limit);
  };

  return {
    last5Min: getLastMinutes(5),
    last10Min: getLastMinutes(10),
    last20Min: getLastMinutes(20),
    last30Days: getLastDays(30),
  };
};



export type IpStats = {
  total_requests: number;
  count_5_min: string;
  count_10_min: string;
  count_20_min: string;
  count_30_days: string;
};

export const checkIpLimit = (ipData: IpStats[]) => {
  if (!ipData || ipData.length === 0) return;

  const data = ipData[0];

  const count5 = Number(data?.count_5_min);
  const count10 = Number(data?.count_10_min);
  const count20 = Number(data?.count_20_min);
  const count30 = Number(data?.count_30_days);

  // Priority 1 → 30 Days Block
  if (count30 >= 20) {
     throw new CustomError("You are blocked for 30 days due to excessive requests.", 400);
  }

  // Priority 2 → 20 Minutes Block
  if (count20 > 15) {
    throw new CustomError("You are blocked for 20 minutes due to too many OTP requests.", 400);
  }

  // Priority 3 → 10 Minutes Block
  if (count10 > 10) {
    throw new CustomError("You are blocked for 10 minutes due to too many OTP requests.", 400);
  }

  // Priority 4 → 5 Minutes Block
  if (count5 > 5) {
    throw new CustomError("You are blocked for 5 minutes due to too many OTP requests.", 400);
  }

  // IF NO BLOCK → Allow request
  return true;
};
