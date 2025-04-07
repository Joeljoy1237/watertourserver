const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification
 * @param {Object} subscription - The push subscription object from the browser
 * @param {Object} payload - The payload to send (object)
 */
async function sendPushNotification(subscription, payload) {
  console.log("new notifiaction send!!");
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    return { success: true, result };
  } catch (error) {
    console.error("Push Notification Error:", error);

    // You can return or throw error based on use-case
    return {
      success: false,
      error: error?.body || error.toString(),
      statusCode: error?.statusCode,
    };
  }
}

module.exports = { sendPushNotification };
