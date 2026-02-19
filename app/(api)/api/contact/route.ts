import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENTS = [
  "pithymeansafrica@gmail.com",
  "pithymeans@gmail.com",
  "info@pithymeansplus.com",
];

const INQUIRY_LABELS: Record<string, string> = {
  investor:     "Investor Inquiry",
  partnership:  "Partnership Inquiry",
  consultation: "Book a Consultation",
  diaspora:     "Diaspora Investor",
  general:      "General Inquiry",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name    = (body.name    as string)?.trim();
    const email   = (body.email   as string)?.trim();
    const type    = (body.type    as string)?.trim() || "general";
    const message = (body.message as string)?.trim();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const inquiryLabel = INQUIRY_LABELS[type] ?? "General Inquiry";

    await resend.emails.send({
      from: "Pithy Means Africa <onboarding@resend.dev>",
      to: RECIPIENTS,
      subject: `${inquiryLabel} from ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">

          <!-- Header -->
          <div style="background:#1a1209;padding:32px 40px;text-align:center">
            <h1 style="color:#b8924a;font-weight:300;font-size:22px;letter-spacing:0.1em;margin:0">
              PITHY MEANS AFRICA
            </h1>
            <p style="color:#888;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:8px 0 0">
              New Contact Inquiry
            </p>
          </div>

          <!-- Body -->
          <div style="background:#fdfaf5;padding:40px">

            <!-- Inquiry type badge -->
            <p style="margin:0 0 28px;text-align:center">
              <span style="display:inline-block;background:#b8924a;color:#fff;font-family:sans-serif;
                font-size:11px;letter-spacing:0.2em;text-transform:uppercase;
                padding:6px 18px;border-radius:2px">
                ${inquiryLabel}
              </span>
            </p>

            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
                  color:#888;background:#f0e8d8;width:140px;border-bottom:1px solid #e0d0b8">
                  Full Name
                </td>
                <td style="padding:14px 16px;font-size:14px;color:#1a1209;
                  background:#fdfaf5;border-bottom:1px solid #e0d0b8">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
                  color:#888;background:#f0e8d8;border-bottom:1px solid #e0d0b8">
                  Email
                </td>
                <td style="padding:14px 16px;font-size:14px;color:#1a1209;
                  background:#fdfaf5;border-bottom:1px solid #e0d0b8">
                  <a href="mailto:${email}" style="color:#b8924a;text-decoration:none">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
                  color:#888;background:#f0e8d8;border-bottom:1px solid #e0d0b8">
                  Inquiry Type
                </td>
                <td style="padding:14px 16px;font-size:14px;color:#1a1209;
                  background:#fdfaf5;border-bottom:1px solid #e0d0b8">
                  ${inquiryLabel}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
                  color:#888;background:#f0e8d8;vertical-align:top">
                  Message
                </td>
                <td style="padding:14px 16px;font-size:14px;color:#1a1209;
                  background:#fdfaf5;line-height:1.8">
                  ${message.replace(/\n/g, "<br/>")}
                </td>
              </tr>
            </table>

            <!-- Reply CTA -->
            <div style="margin-top:32px;padding:20px;background:#f0e8d8;border-left:3px solid #b8924a">
              <p style="margin:0;font-family:sans-serif;font-size:12px;color:#666;line-height:1.6">
                Reply directly to this email to respond to <strong>${name}</strong> at
                <a href="mailto:${email}" style="color:#b8924a">${email}</a>.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#1a1209;padding:20px 40px;text-align:center">
            <p style="color:#555;font-size:11px;letter-spacing:0.1em;margin:0">
              Submitted via pithymeansafrica.com
            </p>
          </div>

        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Email error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}