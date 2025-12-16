import { assertValue } from "@workspace/utils";
import { Resend } from "resend";

const key = process.env.RESEND_SECRET;

export const resend = new Resend(key);
