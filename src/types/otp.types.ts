export interface otpPayload {
    OTP_PLATFORM:string,
    OTP_TYPE: string;
    EMAIL: string;
    PHONE: string;
}
export interface sendOtpResponse {
    OTP_TYPE: string;
    EMAIL: string;
    PHONE: string;
    OTP: string;
}   