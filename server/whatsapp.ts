import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type ConnectionState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session directory for storing auth state
const AUTH_DIR = path.join(__dirname, "..", "auth_info_baileys");

// Connection state tracking
export let isWAConnected = false;
export let currentQR: string | null = null;
let sock: WASocket | null = null;

/**
 * Initialize WhatsApp connection
 */
export async function initWhatsApp(): Promise<void> {
  try {
    console.log("🔧 Initializing WhatsApp connection...");

    // Load auth state from files
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    // Create Baileys socket
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: "silent" }), // Suppress Baileys logs, we'll handle our own
    });

    // Save credentials whenever they update
    sock.ev.on("creds.update", saveCreds);

    // Handle connection updates
    sock.ev.on("connection.update", (update: ConnectionState) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // QR code received for authentication
        currentQR = qr;
        console.log("\n📱 Scan this QR code with WhatsApp:");
        qrcode.generate(qr, { small: true });
        isWAConnected = false;
      }

      if (connection === "close") {
        // Connection closed
        isWAConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log("🔄 Reconnecting to WhatsApp...");
          initWhatsApp(); // Reconnect
        } else {
          console.log("❌ WhatsApp connection logged out. Please scan QR code again.");
          currentQR = null;
        }
      } else if (connection === "open") {
        // Connection successful
        isWAConnected = true;
        currentQR = null;
        console.log("✅ WhatsApp connected successfully!");
        if (sock?.user) {
          console.log(`👤 Connected as: ${sock.user.name || sock.user.id}`);
        }
      } else if (connection === "connecting") {
        console.log("🔄 Connecting to WhatsApp...");
        isWAConnected = false;
      }
    });

    // Handle any errors
    sock.ev.on("error", (err) => {
      console.error("❌ WhatsApp error:", err);
      isWAConnected = false;
    });

    console.log("✅ WhatsApp initialization complete. Waiting for connection...");
  } catch (error) {
    console.error("❌ Failed to initialize WhatsApp:", error);
    isWAConnected = false;
    throw error;
  }
}

/**
 * Send WhatsApp message to a phone number
 * @param phone - Phone number (will be formatted)
 * @param message - Message text to send
 * @returns Promise resolving to message send status
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sock || !isWAConnected) {
      return {
        success: false,
        error: "WhatsApp is not connected. Please connect first.",
      };
    }

    // Format phone number and create JID
    const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits
    const jid = `${cleanPhone}@s.whatsapp.net`;

    // Send message
    await sock.sendMessage(jid, { text: message });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to send WhatsApp message:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

