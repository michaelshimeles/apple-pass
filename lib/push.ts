import apn from "apn";

const apnProvider = new apn.Provider({
  token: {
    key: Buffer.from(process.env.APN_KEY_P8!, "base64").toString(),
    keyId: process.env.APN_KEY_ID!,
    teamId: process.env.APPLE_TEAM_ID!,
  },
  production: true, // or false if testing in sandbox
});

export const sendPushUpdate = async (pushTokens: string[]) => {
  const note = new apn.Notification();
  note.topic = process.env.PASS_TYPE_IDENTIFIER!;

  console.log("🔍 Topic being sent1:", note.topic);

  note.pushType = "background";
  note.priority = 10;

  for (const token of pushTokens) {
    try {
      const result = await apnProvider.send(note, token);
      console.log("APNs result:", result.sent.length ? "✅ Sent" : "❌ Failed", token);
    } catch (err) {
      console.error("APNs error:", err);
    }
  }
};
