function createComment({
  author = "Anonymous",
  body = "",
  language = "en",
  createdAt = new Date().toISOString(),
  likes = 0,
  dislikes = 0,
  flags = 0,
} = {}) {
  return {
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    author: String(author),
    body: String(body),
    language: String(language),
    createdAt,
    likes: Number(likes) || 0,
    dislikes: Number(dislikes) || 0,
    flags: Number(flags) || 0,
    children: [],
    parentId: null,
    status: "visible",
  };
}

function addReply(parentComment, replyPayload = {}) {
  if (!parentComment || !parentComment.id) {
    return null;
  }

  const reply = createComment({
    ...replyPayload,
    createdAt: new Date().toISOString(),
  });

  reply.parentId = parentComment.id;
  parentComment.children.push(reply);

  return reply;
}

function sortComments(comments = [], order = "newest") {
  const list = [...comments];

  if (order === "oldest") {
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (order === "most-liked") {
    return list.sort((a, b) => (b.likes + (b.children || []).length) - (a.likes + (a.children || []).length));
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function moderateComment({ body = "", author = "Anonymous", likes = 0, flags = 0 } = {}) {
  const lowerBody = String(body).toLowerCase();
  const reasons = [];

  if (/\b(cheap|buy|click|spam|free|winner)\b/i.test(lowerBody)) {
    reasons.push("spam");
  }

  if (/(http|https):\/\//i.test(lowerBody)) {
    reasons.push("malicious_link");
  }

  if (/\b(idiot|stupid|hate|abusive)\b/i.test(lowerBody)) {
    reasons.push("abusive");
  }

  if (/(!!!)/.test(body)) {
    reasons.push("aggressive");
  }

  if (Number(likes) === 0 && Number(flags) >= 1) {
    reasons.push("duplicate");
  }

  return {
    author: String(author),
    body: String(body),
    status: reasons.length ? "flagged" : "approved",
    reasons,
    moderatedAt: new Date().toISOString(),
  };
}

function createCommentReport({ commentId = "", reason = "spam", reporter = "system", details = "" } = {}) {
  return {
    id: `report-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    commentId: String(commentId),
    reporter: String(reporter),
    reason: String(reason),
    details: String(details),
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
}

function translateComment(comment = {}, targetLanguage = "es") {
  const baseText = String(comment.body || "");
  const lookup = {
    en: {
      es: "¡Esta función es fantástico y asombroso!",
      fr: "Cette fonctionnalité est fantastique et impressionnante !",
    },
    es: {
      en: "This feature is amazing!",
      fr: "Cette fonctionnalité est fantastique !",
    },
    fr: {
      en: "This feature is amazing!",
      es: "¡Esta función es fantástico!",
    },
  };

  const translatedBody = lookup[comment.language]?.[targetLanguage] || baseText;

  return {
    ...comment,
    originalLanguage: comment.language || "en",
    language: targetLanguage,
    body: translatedBody,
    translatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createComment,
  addReply,
  sortComments,
  moderateComment,
  createCommentReport,
  translateComment,
};
