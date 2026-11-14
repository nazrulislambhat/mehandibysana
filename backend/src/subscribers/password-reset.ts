import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import {
  AuthWorkflowEvents,
  CustomerWorkflowEvents,
  UserEvents,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import { getEffectiveEmailSettings } from "../lib/email-settings";
import {
  dispatchStudioNotification,
  renderBrandedStudioEmailHtml,
  sendStudioEmail,
} from "../lib/notifications";

interface PasswordResetPayload {
  entity_id?: string;
  actor_type?: string;
  token?: string;
  metadata?: Record<string, unknown>;
}

interface UserInvitePayload {
  id?: string;
  token?: string;
  user?: { email?: string; first_name?: string };
}

interface CustomerCreatedPayload {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default async function authAndAccountHandler({
  event: { name, data },
  container,
}: SubscriberArgs<Record<string, unknown>>) {
  const settings = getEffectiveEmailSettings();
  const siteUrl = (settings.storefrontUrl || "https://mehandibysana.com").replace(/\/+$/, "");
  const adminUrl = (process.env.MEDUSA_ADMIN_URL || "https://admin.mehandibysana.com").replace(/\/+$/, "");

  // 1. Password Reset Request
  if (name === AuthWorkflowEvents.PASSWORD_RESET) {
    const pwData = data as PasswordResetPayload;
    const recipientEmail = String(pwData.entity_id || "").trim();
    const token = String(pwData.token || "").trim();
    const actorType = String(pwData.actor_type || "customer").toLowerCase();

    if (!recipientEmail || !token) {
      console.warn("[Subscriber auth.password_reset] Missing recipientEmail or token.");
      return;
    }

    const isCustomer = actorType === "customer";
    const resetUrl = isCustomer
      ? `${siteUrl}/account/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(recipientEmail)}`
      : `${adminUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(recipientEmail)}`;

    const ctaLabel = isCustomer ? "Reset Your Password" : "Reset Admin Password";
    const accountTypeLabel = isCustomer ? "customer" : "studio admin";

    const summary = [
      `Assalamu Alaikum / Hello,`,
      `We received a request to reset the password for your Mehandi by Sana ${accountTypeLabel} account (${recipientEmail}).`,
      `To choose a new password, click the secure link below. This password reset link is valid for 15 minutes.`,
      `If you did not request this change, please ignore this email. Your password will remain unchanged.`,
    ].join("\n\n");

    try {
      await dispatchStudioNotification({
        type: "password_reset",
        recipientEmail,
        recipientName: isCustomer ? "Customer" : "Staff Member",
        referenceId: `PW-RESET-${token.slice(0, 8).toUpperCase()}`,
        summary,
        ctaLabel,
        ctaUrl: resetUrl,
        skipAdminAlert: isCustomer,
        scope: container as any,
      });
      console.log(`[Subscriber auth.password_reset] Reset link dispatched to ${recipientEmail}`);
    } catch (err) {
      console.warn(`[Subscriber auth.password_reset] Error sending password reset to ${recipientEmail}:`, err);
    }
    return;
  }

  // 2. Staff Member / Admin User Invite Token
  if (name === UserEvents.INVITE_TOKEN_GENERATED) {
    const inviteData = data as UserInvitePayload;
    const recipientEmail = String(inviteData.user?.email || "").trim();
    const token = String(inviteData.token || "").trim();

    if (!recipientEmail || !token) return;

    const inviteUrl = `${adminUrl}/invite?token=${encodeURIComponent(token)}`;
    const summary = [
      `Assalamu Alaikum / Hello,`,
      `You have been invited to join the Mehandi by Sana studio operations and admin portal.`,
      `Click the button below to accept your invitation and configure your admin credentials.`,
    ].join("\n\n");

    try {
      await dispatchStudioNotification({
        type: "admin_invite",
        recipientEmail,
        recipientName: inviteData.user?.first_name || "Team Member",
        referenceId: `INVITE-${token.slice(0, 8).toUpperCase()}`,
        summary,
        ctaLabel: "Accept Studio Invitation",
        ctaUrl: inviteUrl,
        scope: container as any,
      });
      console.log(`[Subscriber user.invite] Invite email dispatched to ${recipientEmail}`);
    } catch (err) {
      console.warn(`[Subscriber user.invite] Error sending invite to ${recipientEmail}:`, err);
    }
    return;
  }

  // 3. New Customer Welcome Email
  if (name === CustomerWorkflowEvents.CREATED) {
    const custData = data as CustomerCreatedPayload;
    const recipientEmail = String(custData.email || "").trim();
    if (!recipientEmail) return;

    const firstName = custData.first_name?.trim() || "Henna Lover";
    const shopUrl = `${siteUrl}/shop`;
    const careUrl = `${siteUrl}/henna-care`;

    const summary = [
      `Assalamu Alaikum / Welcome ${firstName},`,
      `Thank you for creating an account with Mehandi by Sana. We are dedicated to 100% natural, PPD-free organic henna and small-batch botanical artistry across Srinagar and Bengaluru.`,
      `Through your account, you can track fresh cone batches, view order history, and access curated stain care guides.`,
    ].join("\n\n");

    const html = renderBrandedStudioEmailHtml({
      eyebrow: "Welcome to the Studio",
      heading: "Welcome to Mehandi by Sana",
      bodyParagraphs: [
        `Assalamu Alaikum / Welcome ${firstName},`,
        `Thank you for joining Mehandi by Sana. Every cone, powder batch, and aftercare elixir we prepare is 100% pure, chemical-free, and formulated from premium Rajasthani Sojat crops and pure essential oils.`,
        `Track orders, discover fresh harvest cone batches, and explore aftercare recommendations anytime from our apothecary.`,
      ],
      referenceId: `WELCOME-${recipientEmail.split("@")[0].toUpperCase()}`,
      ctaLabel: "Explore Fresh Cones",
      ctaUrl: shopUrl,
      storefrontUrl: siteUrl,
      footerNote: `Read our Stain Progression & Care Guide anytime at ${careUrl}`,
    });

    try {
      await sendStudioEmail({
        to: recipientEmail,
        subject: `Welcome to Mehandi by Sana — Artisanal Botanical Henna`,
        text: summary,
        html,
        scope: container as any,
      });
      console.log(`[Subscriber customer.created] Welcome email dispatched to ${recipientEmail}`);
    } catch (err) {
      console.warn(`[Subscriber customer.created] Non-fatal error sending welcome to ${recipientEmail}:`, err);
    }
  }
}

export const config: SubscriberConfig = {
  event: [
    AuthWorkflowEvents.PASSWORD_RESET,
    UserEvents.INVITE_TOKEN_GENERATED,
    CustomerWorkflowEvents.CREATED,
  ],
};
