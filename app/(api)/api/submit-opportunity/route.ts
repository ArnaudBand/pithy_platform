// app/%28api%29/api/submit-opportunity/router.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email   = formData.get("email")   as string;
    const sector  = formData.get("sector")  as string;
    const country = formData.get("country") as string;
    const capital = formData.get("capital") as string;
    const summary = formData.get("summary") as string;
    const file    = formData.get("file")    as File | null;

    const attachments: { filename: string; content: Buffer }[] = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name, content: buffer });
    }

    await resend.emails.send({
      from: "Pithy Means Africa <noreply@pithymeansplus.com>",
      to: ["pithymeansafrica@gmail.com", "pithymeans@gmail.com", "denis.bsm1@gmail.com"], // internal team emails
      replyTo: email, // so you can reply back to the submitter
      subject: `New Opportunity — ${sector} (${country})`,
      attachments,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#121a12;padding:32px 40px;text-align:center">
            <h1 style="color:#4ab864;font-weight:300;font-size:22px;letter-spacing:0.1em;margin:0">PITHY MEANS AFRICA</h1>
            <p style="color:#888;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;margin:8px 0 0">New Opportunity Submission</p>
          </div>
          <div style="background:#f1f8ef;padding:40px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;background:#dfedde;width:160px;border-bottom:1px solid #c8ddc6">Sender Email</td>
                <td style="padding:14px 16px;font-size:14px;color:#121a12;background:#f1f8ef;border-bottom:1px solid #c8ddc6">
                  <a href="mailto:${email}" style="color:#4ab864">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;background:#dfedde;border-bottom:1px solid #c8ddc6">Sector</td>
                <td style="padding:14px 16px;font-size:14px;color:#121a12;background:#f1f8ef;border-bottom:1px solid #c8ddc6">${sector}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;background:#dfedde;border-bottom:1px solid #c8ddc6">Country</td>
                <td style="padding:14px 16px;font-size:14px;color:#121a12;background:#f1f8ef;border-bottom:1px solid #c8ddc6">${country}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;background:#dfedde;border-bottom:1px solid #c8ddc6">Capital Required</td>
                <td style="padding:14px 16px;font-size:14px;color:#121a12;background:#f1f8ef;border-bottom:1px solid #c8ddc6">${capital}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;background:#dfedde;vertical-align:top">Summary</td>
                <td style="padding:14px 16px;font-size:14px;color:#121a12;background:#f1f8ef;line-height:1.7">${summary.replace(/\n/g, "<br/>")}</td>
              </tr>
            </table>
            ${attachments.length > 0 ? `<p style="margin-top:24px;font-size:12px;color:#888">📎 Attachment: <strong>${file!.name}</strong></p>` : ""}
          </div>
          <div style="background:#121a12;padding:20px 40px;text-align:center">
            <p style="color:#555;font-size:11px;letter-spacing:0.1em;margin:0">Submitted via pithymeansafrica.com</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}