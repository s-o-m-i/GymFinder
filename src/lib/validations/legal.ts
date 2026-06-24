import { z } from "zod";

export const ACCEPT_TERMS_MESSAGE =
  "You must agree to the Terms of Service and Privacy Policy.";

export const acceptedTermsField = z.boolean().refine((v) => v === true, {
  message: ACCEPT_TERMS_MESSAGE,
});
