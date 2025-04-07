const express = require("express");
const { sendPushNotification } = require("../utils/pushService");

const router = express.Router();

/**
 * POST /push
 * Body: {
 *   subscription: {...},
 *   payload: {
 *     title: "Hello",
 *     body: "You got a message!",
 *     url: "https://example.com"
 *   }
 */
router.post("/", async (req, res) => {
  const { subscription, payload } = req.body;

  if (!subscription || !payload) {
    return res.status(400).json({ error: "Missing subscription or payload" });
  }

  const result = await sendPushNotification(subscription, payload);

  if (!result.success) {
    return res.status(result.statusCode || 500).json({ error: result.error });
  }

  res.status(200).json({ message: "Push sent successfully", result: result.result });
});

module.exports = router;
