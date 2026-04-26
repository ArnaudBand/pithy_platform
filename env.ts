const env = {
  emails: {
    apikey: String(process.env.RESEND_API_KEY)
  },
  payment: {
    public: String(process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY),
    secret: String(process.env.FLUTTERWAVE_SECRET_KEY),
    encryption: String(process.env.FLUTTERWAVE_ENCRYPTION_KEY),
    hash: String(process.env.SECRET_HASH)
  },
  endpoint: {
    base: String(process.env.NEXT_PUBLIC_BASE_URL),
  },
  // Java Spring Boot backend
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080",
  }
}

export default env;