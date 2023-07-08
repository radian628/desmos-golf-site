import * as z from "zod";
import * as fs from "node:fs/promises";
const serverConfigParser = z.object({
    hostname: z.string(),
    port: z.number(),
});
export async function getServerConfig() {
    const config = (await fs.readFile("server-config.json")).toString();
    const parsedConfig = serverConfigParser.parse(JSON.parse(config));
    return parsedConfig;
}
