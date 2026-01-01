import arcjet, {
  detectBot,
  shield,
  tokenBucket,
  validateEmail,
} from "@arcjet/node";

const isDev = process.env.NODE_ENV === "development";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    shield({ mode: isDev ? "DRY_RUN" : "LIVE" }),

    detectBot({
      mode: isDev ? "DRY_RUN" : "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),

    validateEmail({
      mode: isDev ? "DRY_RUN" : "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),

    tokenBucket({
      mode: isDev ? "DRY_RUN" : "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
