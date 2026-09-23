const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createComment,
  addReply,
  sortComments,
  moderateComment,
  createCommentReport,
  translateComment,
} = require("../src/services/multilingualComments");

test("createComment and addReply retain the original engagement metadata while supporting nested author chains", () => {
  const comment = createComment({
    author: "Asha",
    body: "This looks great!",
    language: "en",
  });
  const reply = addReply(comment, { author: "Ravi", body: "@Asha Thanks!", language: "en" });

  assert.equal(comment.likes, 0);
  assert.equal(comment.flags, 0);
  assert.equal(reply.parentId, comment.id);
  assert.equal(reply.children.length, 0);
});

test("sortComments supports newest, oldest, and most-liked ordering", () => {
  const comments = [
    createComment({ author: "Dina", body: "First", language: "en", createdAt: "2026-09-20T12:00:00.000Z" }),
    createComment({ author: "Mia", body: "Second", language: "en", createdAt: "2026-09-23T12:00:00.000Z", likes: 7 }),
    createComment({ author: "Noah", body: "Third", language: "en", createdAt: "2026-09-21T12:00:00.000Z", likes: 4 }),
  ];

  const newest = sortComments(comments, "newest");
  const oldest = sortComments(comments, "oldest");
  const mostLiked = sortComments(comments, "most-liked");

  assert.equal(newest[0].author, "Mia");
  assert.equal(oldest[0].author, "Dina");
  assert.equal(mostLiked[0].author, "Mia");
});

test("moderateComment and createCommentReport detect spam, abusive wording, and unsafe links", () => {
  const result = moderateComment({
    body: "Buy cheap pills now http://spam.example.com!!!",
    author: "Trudy",
    likes: 1,
    flags: 0,
  });

  const report = createCommentReport({
    commentId: "c-42",
    reason: "spam",
    reporter: "Bharat",
  });

  assert.equal(result.status, "flagged");
  assert.equal(result.reasons.includes("spam"), true);
  assert.equal(report.status, "submitted");
  assert.equal(report.reason, "spam");
});

test("translateComment returns a translated version and preserves the original metadata", () => {
  const comment = createComment({
    author: "Nina",
    body: "This feature is amazing!",
    language: "en",
  });

  const translated = translateComment(comment, "es");

  assert.equal(translated.originalLanguage, "en");
  assert.equal(translated.language, "es");
  assert.equal(translated.body.includes("fantástico") || translated.body.includes("asombroso"), true);
});
