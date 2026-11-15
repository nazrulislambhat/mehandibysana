import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import {
  AuthWorkflowEvents,
  CustomerWorkflowEvents,
  InviteWorkflowEvents,
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
  const rawAdminHost = (
    process.env.MEDUSA_ADMIN_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://api.mehandibysana.com/app"
      : "http://localhost:9000/app")
  ).replace(/\/+$/, "");
  const adminUrl = rawAdminHost.endsWith("/app") ? rawAdminHost : `${rawAdminHost}/app`;

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
      `We received a request to reset the password for your Mehandi By Sana ${accountTypeLabel} account (${recipientEmail}).`,
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

  // 2. Staff Member / Admin User Invite Token (Medusa v2 InviteWorkflowEvents.CREATED & RESENT)
  if (
    name === InviteWorkflowEvents.CREATED ||
    name === InviteWorkflowEvents.RESENT ||
    name === UserEvents.INVITE_TOKEN_GENERATED
  ) {
    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.invites)
        ? (data as any).invites
        : [data];

    const inviteIds = rawItems
      .map((item: any) => item?.id || item?.invite_id)
      .filter((id: unknown): id is string => typeof id === "string" && Boolean(id.trim()));

    // Path A: Query invite entity by id from Medusa graph
    if (inviteIds.length > 0) {
      try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY) as any;
        for (const inviteId of inviteIds) {
          try {
            const { data: invites } = await query.graph({
              entity: "invite",
              fields: ["id", "email", "token", "expires_at"],
              filters: { id: inviteId },
            });
            const invite = invites?.[0];
            if (!invite?.email || !invite?.token) {
              console.warn(`[Subscriber invite] Invite ${inviteId} missing email or token.`);
              continue;
            }

            const inviteUrl = `${adminUrl}/invite?token=${encodeURIComponent(invite.token)}`;
            const summary = [
              `Assalamu Alaikum / Hello,`,
              `You have been invited to join the Mehandi By Sana studio operations and admin portal.`,
              `Click the button below to accept your invitation and set up your admin credentials.`,
            ].join("\n\n");

            const html = renderBrandedStudioEmailHtml({
              eyebrow: "Staff Invitation",
              heading: "Invitation to Mehandi By Sana Admin",
              bodyParagraphs: [
                "Assalamu Alaikum / Hello,",
                "You have been invited to join the Mehandi By Sana studio operations and admin portal.",
                "As an authorized team member, you will have access to customer orders, fresh cone batch inventory, and live client inquiries.",
                "Please click the button below to accept your invitation and configure your password.",
              ],
              referenceId: `INVITE-${invite.id.slice(0, 8).toUpperCase()}`,
              ctaLabel: "Accept Studio Invitation",
              ctaUrl: inviteUrl,
              storefrontUrl: siteUrl,
              footerNote: "This invitation link is valid for 7 days. If you did not expect this invitation, you can safely ignore this email.",
            });

            await sendStudioEmail({
              to: invite.email,
              subject: "Invitation to Mehandi By Sana Admin Portal",
              text: `${summary}\n\nAccept your invitation: ${inviteUrl}`,
              html,
              scope: container as any,
            });

            console.log(`[Subscriber invite] Branded invitation email dispatched to ${invite.email}`);
          } catch (itemErr) {
            console.warn(`[Subscriber invite] Failed processing invite ${inviteId}:`, itemErr);
          }
        }
      } catch (graphErr) {
        console.warn("[Subscriber invite] Graph query failed for invites:", graphErr);
      }
      return;
    }

    // Path B: Fallback if raw payload provided token and email directly
    const inviteData = data as UserInvitePayload;
    const recipientEmail = String(inviteData.user?.email || "").trim();
    const token = String(inviteData.token || "").trim();

    if (!recipientEmail || !token) return;

    const inviteUrl = `${adminUrl}/invite?token=${encodeURIComponent(token)}`;
    const summary = [
      `Assalamu Alaikum / Hello,`,
      `You have been invited to join the Mehandi By Sana studio operations and admin portal.`,
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
      `Thank you for creating an account with Mehandi By Sana. We are dedicated to 100% natural, PPD-free organic henna across Kashmir and Bengaluru.`,
      `Through your account, you can track fresh cone batches, view order history, and access curated stain care guides.`,
    ].join("\n\n");

    const html = renderBrandedStudioEmailHtml({
      eyebrow: "Welcome to the Studio",
      heading: "Welcome to Mehandi By Sana",
      bodyParagraphs: [
        `Assalamu Alaikum / Welcome ${firstName},`,
        `Thank you for joining Mehandi By Sana. Every cone, powder batch, and aftercare product we prepare is 100% pure, chemical-free, and crafted from premium Rajasthani Sojat crops and pure essential oils.`,
        `Track orders, discover fresh harvest cone batches, and explore aftercare recommendations anytime from our shop.`,
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
        subject: `Welcome to Mehandi By Sana — 100% Pure Organic Henna`,
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
    InviteWorkflowEvents.CREATED,
    InviteWorkflowEvents.RESENT,
    UserEvents.INVITE_TOKEN_GENERATED,
    CustomerWorkflowEvents.CREATED,
  ],
};
