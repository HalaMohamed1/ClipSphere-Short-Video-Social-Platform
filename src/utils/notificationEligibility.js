const DEFAULT_IN_APP = {
  followers: true,
  comments: true,
  likes: true,
  tips: true,
};

const DEFAULT_EMAIL = {
  followers: false,
  comments: false,
  likes: false,
  tips: false,
};

export function resolveNotificationChannels(targetUser, eventKey) {
  const inApp = targetUser.notificationPreferences?.inApp;
  const email = targetUser.notificationPreferences?.email;

  const shouldNotifyInApp =
    inApp?.[eventKey] !== undefined ? inApp[eventKey] : DEFAULT_IN_APP[eventKey];

  const shouldQueueEmail =
    email?.[eventKey] !== undefined ? email[eventKey] : DEFAULT_EMAIL[eventKey];

  return { shouldNotifyInApp, shouldQueueEmail };
}
