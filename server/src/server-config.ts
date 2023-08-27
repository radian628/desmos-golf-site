import { config } from "dotenv";

export async function getServerConfig() {
  const { error, parsed: cfg } = config();
  if (error) throw error;

  const portString = cfg?.port ?? "80";
  if (!/^\d{1,5}$/.test(portString))
    throw new Error(`Port '${portString}' is not a valid port.`);
  const port = parseInt(portString);

  const hostname = cfg?.hostname ?? "localhost";
  if (!hostname) throw new Error(`Hostname cannot be empty.`);

  const adminPass = cfg?.admin_pass;
  if (!adminPass)
    throw new Error(
      "Admin passcode missing. Add `admin_pass=[passcode here]` to the file server/.env."
    );

  return { port, hostname, adminPass };
}
