export function resolveNotificationChannels(targetUser, eventKey) {
  const prefs = targetUser.notificationPreferences || {};
  
  // Map event keys to notification preference fields
  // eventKey: 'welcome' -> emailOnWelcome, inAppOnWelcome
  // eventKey: 'likes' -> emailOnNewEngagement, inAppOnNewEngagement
  // eventKey: 'comments' -> emailOnNewEngagement, inAppOnNewEngagement
  // eventKey: 'followers' -> emailOnNewEngagement, inAppOnNewEngagement
  // eventKey: 'tips' -> emailOnNewEngagement, inAppOnNewEngagement
  
  let shouldQueueEmail = true;
  let shouldNotifyInApp = true;
  
  if (eventKey === 'welcome') {
    shouldQueueEmail = prefs.emailOnWelcome !== false;
    shouldNotifyInApp = prefs.inAppOnWelcome !== false;
  } else {
    // All other events (likes, comments, followers, tips) use engagement preferences
    shouldQueueEmail = prefs.emailOnNewEngagement !== false;
    shouldNotifyInApp = prefs.inAppOnNewEngagement !== false;
  }
  
  return { shouldNotifyInApp, shouldQueueEmail };
}
