import { assertValue } from "@workspace/utils";
import { Resend } from "resend";

const key = assertValue(process.env.RESEND_SECRET, "RESEND_SECRET is not set");

export const resend = new Resend(key);
