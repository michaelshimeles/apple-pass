import apn from 'apn';

const getApnProvider = () => {
  const keyBuffer = Buffer.from(process.env.APN_KEY_P8!, 'base64');

  return new apn.Provider({
    token: {
      key: keyBuffer,
      keyId: process.env.APN_KEY_ID!,
      teamId: process.env.APPLE_TEAM_ID!,
    },
    production: true, // or false for sandbox
  });
};

export async function sendPassPushNotification(passTypeIdentifier: string, pushToken: string) {
  const apnProvider = getApnProvider();

  const note = new apn.Notification();
  note.topic = passTypeIdentifier

  console.log("🔍 Topic being sent2:", note.topic);
  note.pushType = "background";

  try {
    const result = await apnProvider.send(note, pushToken); // use the pushToken here
    console.log("APNs push result:", result);
    console.log("APNs push result:", result?.failed?.[0]?.response);

    apnProvider.shutdown();
  } catch (err) {
    console.error("Failed to send APNs push:", err);
  }
}

