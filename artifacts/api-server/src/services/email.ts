import nodemailer from "nodemailer";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage.js";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user ?? "noreply@lfour.ru";

  if (!host || !user || !pass) {
    return null;
  }

  return {
    from,
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Readable; contentType: string }>;
}): Promise<{ ok: boolean; message: string }> {
  const t = getTransport();
  if (!t) {
    return {
      ok: false,
      message: "SMTP не настроен. Укажите SMTP_HOST, SMTP_USER, SMTP_PASS в настройках.",
    };
  }
  try {
    const { attachments, ...rest } = opts;
    await t.transport.sendMail({
      from: t.from,
      ...rest,
      ...(attachments?.length ? { attachments } : {}),
    });
    return { ok: true, message: "Письмо отправлено" };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Ошибка отправки" };
  }
}

// ─── Calc file delivery email ────────────────────────────────────────────────

export async function sendCalcEmail(opts: {
  to: string;
  name: string | null;
  phone: string;
  productName: string | null;
  calcFileUrl: string;
  requestId: number;
}): Promise<{ ok: boolean; message: string }> {
  const { to, name, phone, productName, calcFileUrl, requestId } = opts;
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Расчёт освещения</title></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #D5D0C5;">
    <div style="background:#2B2D2B;padding:20px 28px;">
      <span style="color:#E8500B;font-size:20px;font-weight:900;letter-spacing:2px;">ЭЛФОР</span>
      <span style="color:#aaa;font-size:12px;margin-left:auto;float:right;">Расчёт освещения</span>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#2B2D2B;text-transform:uppercase;letter-spacing:1px;">Ваш расчёт готов</h2>
      <p style="color:#555;margin:0 0 8px;">Здравствуйте${name ? `, <strong>${name}</strong>` : ""}!</p>
      <p style="color:#555;margin:0 0 24px;">Мы подготовили расчёт освещения для вашего объекта. Файл расчёта прикреплён к этому письму.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${productName ? `<tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;width:140px;">Светильник</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">${productName}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Заявка №</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">${requestId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Дата</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">${now} МСК</td>
        </tr>
      </table>

      <div style="background:#FFF8F5;border:1px solid #F0C4B0;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#555;">Расчёт включает количество светильников, схему расстановки и итоговую мощность. По вопросам обращайтесь к нашим менеджерам.</p>
      </div>

      <p style="color:#777;font-size:13px;margin:0;">Телефон: <a href="tel:${phone}" style="color:#E8500B;">${phone}</a> | <a href="mailto:info@lfour.ru" style="color:#E8500B;">info@lfour.ru</a></p>
    </div>
    <div style="background:#F4F1EA;padding:14px 28px;text-align:center;">
      <span style="color:#999;font-size:11px;">© ЭЛФОР — промышленные LED светильники. lfour.ru</span>
    </div>
  </div>
</body>
</html>`;

  const attachments: Array<{ filename: string; content: import("stream").Readable; contentType: string }> = [];
  try {
    const storage = new ObjectStorageService();
    const file = await storage.getObjectEntityFile(calcFileUrl);
    const [meta] = await file.getMetadata();
    const ct = (meta.contentType as string) || "application/octet-stream";
    const ext = ct.includes("pdf") ? ".pdf"
      : ct.includes("word") || ct.includes("docx") ? ".docx"
      : ct.includes("excel") || ct.includes("xlsx") ? ".xlsx"
      : "";
    attachments.push({
      filename: `Расчёт_освещения_№${requestId}${ext}`,
      content: file.createReadStream(),
      contentType: ct,
    });
  } catch (_err) {
    // send without attachment if file unavailable
  }

  return sendMail({ to, subject: `Расчёт освещения №${requestId} — ЭЛФОР`, html, attachments });
}

// ─── Chat message notification ──────────────────────────────────────────────

export function isOffHoursMoscow(): boolean {
  const now = new Date();
  const moscow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const day = moscow.getUTCDay(); // 0=Sun, 6=Sat
  const hour = moscow.getUTCHours();
  const isWeekend = day === 0 || day === 6;
  const isOutside = hour < 9 || hour >= 18;
  return isWeekend || isOutside;
}

export async function sendChatNotificationEmail(opts: {
  to: string;
  visitorName: string | null;
  visitorPhone: string | null;
  messageText: string;
  sessionId: number;
  isNewSession: boolean;
}): Promise<void> {
  const { to, visitorName, visitorPhone, messageText, sessionId, isNewSession } = opts;
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const subject = isNewSession
    ? `Новый чат от ${visitorName ?? "посетителя"} — ЭЛФОР`
    : `Новое сообщение в чате от ${visitorName ?? "посетителя"} — ЭЛФОР`;

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Уведомление чата</title></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #D5D0C5;">
    <div style="background:#2B2D2B;padding:20px 28px;display:flex;align-items:center;gap:16px;">
      <span style="color:#E8500B;font-size:20px;font-weight:900;letter-spacing:2px;">ЭЛФОР</span>
      <span style="color:#aaa;font-size:12px;margin-left:auto;">Уведомление чата</span>
    </div>
    <div style="padding:28px;">
      <div style="background:#F4F1EA;border-left:4px solid ${isNewSession ? "#22c55e" : "#E8500B"};padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;font-weight:bold;color:#2B2D2B;">
          ${isNewSession ? "🟢 Новый диалог открыт" : "💬 Новое сообщение"}
        </p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;width:120px;">Посетитель</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;font-weight:bold;">${visitorName ?? "Аноним"}</td>
        </tr>
        ${visitorPhone ? `<tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Телефон</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">${visitorPhone}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Время</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">${now} МСК</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Диалог</td>
          <td style="padding:6px 0;font-size:14px;color:#2B2D2B;">#${sessionId}</td>
        </tr>
      </table>

      <div style="background:#F9F9F9;border:1px solid #E5E5E5;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Сообщение</p>
        <p style="margin:0;font-size:14px;color:#2B2D2B;line-height:1.6;">${messageText}</p>
      </div>

      <a href="https://lfour.ru/admin/chat"
         style="display:inline-block;background:#E8500B;color:#fff;text-decoration:none;padding:10px 22px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        Открыть чат →
      </a>
    </div>
    <div style="background:#F4F1EA;padding:14px 28px;text-align:center;">
      <span style="color:#999;font-size:11px;">© ЭЛФОР — промышленные LED светильники. lfour.ru</span>
    </div>
  </div>
</body>
</html>`;

  await sendMail({ to, subject, html });
}

// ─── Status change notification ────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В работе",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export async function sendStatusEmail(order: {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
}): Promise<void> {
  // Archive status — never notify client
  if (order.status === "archive") return;

  const label = STATUS_LABELS[order.status] ?? order.status;
  const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Статус заказа</title></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #D5D0C5;">
    <div style="background:#2B2D2B;padding:24px 32px;">
      <span style="color:#E8500B;font-size:22px;font-weight:900;letter-spacing:2px;">ЭЛФОР</span>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#2B2D2B;">Статус вашего заказа изменён</h2>
      <p style="color:#555;margin:0 0 8px;">Уважаемый(-ая) <strong>${order.customerName}</strong>,</p>
      <p style="color:#555;margin:0 0 24px;">Статус заказа <strong>#${order.id}</strong> обновлён:</p>
      <div style="background:#F4F1EA;border-left:4px solid #E8500B;padding:16px 20px;margin-bottom:24px;">
        <span style="font-size:16px;font-weight:bold;color:#2B2D2B;text-transform:uppercase;">${label}</span>
      </div>
      <p style="color:#555;margin:0 0 8px;">Сумма заказа: <strong>${order.totalAmount.toLocaleString("ru-RU")} ₽</strong></p>
      <p style="color:#777;font-size:13px;margin:32px 0 0;">По вопросам: <a href="mailto:info@lfour.ru" style="color:#E8500B;">info@lfour.ru</a> | 8 (800) 000-00-00</p>
    </div>
    <div style="background:#F4F1EA;padding:16px 32px;text-align:center;">
      <span style="color:#999;font-size:11px;">© ЭЛФОР — промышленные LED светильники. lfour.ru</span>
    </div>
  </div>
</body>
</html>`;

  await sendMail({
    to: order.customerEmail,
    subject: `Заказ #${order.id} — статус: ${label}`,
    html,
  });
}

// ─── Invoice email ──────────────────────────────────────────────────────────

export async function sendInvoiceEmail(order: {
  id: number;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  customerPhone: string;
  deliveryAddress?: string | null;
  totalAmount: number;
  invoiceFilePath?: string | null;
  items: Array<{
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    selectedKelvin?: string | null;
    selectedAngle?: string | null;
  }>;
}): Promise<{ ok: boolean; message: string }> {
  const date = new Date().toLocaleDateString("ru-RU");
  const invoiceNum = `ЭЛФ-${order.id}-${new Date().getFullYear()}`;

  const rows = order.items
    .map(
      (it, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;color:#555;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;">
          <strong>${it.productName}</strong>
          <br><span style="color:#888;font-size:12px;">${it.productSku}${it.selectedKelvin ? ` · ${it.selectedKelvin}` : ""}${it.selectedAngle ? ` · ${it.selectedAngle}` : ""}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;text-align:center;">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;text-align:right;">${it.unitPrice.toLocaleString("ru-RU")} ₽</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E5E5E5;text-align:right;font-weight:bold;">${(it.quantity * it.unitPrice).toLocaleString("ru-RU")} ₽</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Счёт на оплату</title></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:Arial,sans-serif;">
  <div style="max-width:700px;margin:40px auto;background:#fff;border:1px solid #D5D0C5;">
    <!-- Header -->
    <div style="background:#2B2D2B;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#E8500B;font-size:22px;font-weight:900;letter-spacing:2px;">ЭЛФОР</span>
      <span style="color:#aaa;font-size:13px;">lfour.ru | info@lfour.ru</span>
    </div>

    <div style="padding:32px;">
      <!-- Invoice title -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:24px;color:#2B2D2B;text-transform:uppercase;letter-spacing:1px;">Счёт на оплату</h1>
          <p style="margin:0;color:#888;font-size:13px;">№ ${invoiceNum} от ${date}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:13px;color:#555;">Заказ <strong>#${order.id}</strong></p>
        </div>
      </div>

      <!-- Parties -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
        <div style="background:#F4F1EA;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;">Поставщик</p>
          <p style="margin:0;font-weight:bold;color:#2B2D2B;">ООО «ЭЛФОР»</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;">8 (800) 000-00-00<br>info@lfour.ru<br>lfour.ru</p>
        </div>
        <div style="background:#F4F1EA;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;">Покупатель</p>
          <p style="margin:0;font-weight:bold;color:#2B2D2B;">${order.customerCompany ?? order.customerName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;">${order.customerName}<br>${order.customerPhone}${order.deliveryAddress ? `<br>${order.deliveryAddress}` : ""}</p>
        </div>
      </div>

      <!-- Items table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#F4F1EA;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D5D0C5;">№</th>
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D5D0C5;">Наименование</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D5D0C5;">Кол-во</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D5D0C5;">Цена</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D5D0C5;">Сумма</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="padding:12px;text-align:right;font-weight:bold;color:#2B2D2B;font-size:15px;border-top:2px solid #2B2D2B;">ИТОГО:</td>
            <td style="padding:12px;text-align:right;font-weight:bold;color:#E8500B;font-size:18px;border-top:2px solid #2B2D2B;">${order.totalAmount.toLocaleString("ru-RU")} ₽</td>
          </tr>
        </tfoot>
      </table>

      <!-- Note -->
      <div style="background:#FFF8F5;border:1px solid #F0C4B0;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#555;">Оплата производится на основании настоящего счёта. Счёт действителен 5 банковских дней.</p>
      </div>

      <p style="color:#777;font-size:13px;margin:0;">По вопросам оплаты: <a href="mailto:info@lfour.ru" style="color:#E8500B;">info@lfour.ru</a> | 8 (800) 000-00-00</p>
    </div>
    <div style="background:#F4F1EA;padding:16px 32px;text-align:center;">
      <span style="color:#999;font-size:11px;">© ЭЛФОР — промышленные LED светильники. lfour.ru</span>
    </div>
  </div>
</body>
</html>`;

  // Attach uploaded invoice file if present
  const attachments: Array<{ filename: string; content: Readable; contentType: string }> = [];
  if (order.invoiceFilePath) {
    try {
      const storage = new ObjectStorageService();
      const file = await storage.getObjectEntityFile(order.invoiceFilePath);
      const [meta] = await file.getMetadata();
      const ct = (meta.contentType as string) || "application/octet-stream";
      const ext = ct.includes("pdf") ? ".pdf"
        : ct.includes("word") || ct.includes("docx") ? ".docx"
        : ct.includes("excel") || ct.includes("xlsx") ? ".xlsx"
        : "";
      attachments.push({
        filename: `Счёт_${invoiceNum}${ext}`,
        content: file.createReadStream(),
        contentType: ct,
      });
    } catch (_err) {
      // If file not found or storage error — send email without attachment
    }
  }

  return sendMail({
    to: order.customerEmail,
    subject: `Счёт на оплату № ${invoiceNum} — ${order.totalAmount.toLocaleString("ru-RU")} ₽`,
    html,
    attachments,
  });
}
