import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();
  await resend.emails.send({
    from: 'sana@mehandibysana.com',
    to: 'nazrulislambhat@gmail.com', // ← you get notified
    subject: 'New signup on Mehandi by Sana',
    text: `New email signup: ${email}`,
  });
  return Response.json({ ok: true });
}
