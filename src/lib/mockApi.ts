import MockAdapter from "axios-mock-adapter";
import { api } from "./axios";
import { MOckPosts, generateMorePosts } from "../data/mockData";

export function setupMockApi() {
  const mock = new MockAdapter(api, { delayResponse: 500 });

  // mock the recommend feed
  mock.onPost("/feed/recommend").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const cursor = parseInt(data.cursor || "0", 10);
    const hasMore = cursor < 50;

    let items = [];
    if (cursor === 0) {
      items = MOckPosts.map((p) => ({
        content_id: p.id,
        author_id: p.authorId || p.author,
        author_name: p.author,
        author_avatar:
          p.subredditIcon ||
          "https://api.dicebear.com/7.x/identicon/svg?seed=" + p.author,
        title: p.title,
        content: p.content || "",
        cover_url: p.imageUrl || "",
        like_count:
          parseInt(p.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
        reply_count: parseInt(p.comments) || 0,
        favorite_count: 0,
        published_at: Math.floor(Date.now() / 1000) - 3600 * 4,
        is_liked: !!p.isLiked,
        is_favorited: !!p.isFavorited,
        is_following_author: false,
      }));
    } else {
      items = generateMorePosts(cursor, 10).map((p) => ({
        content_id: p.id,
        author_id: p.authorId || p.author,
        author_name: p.author,
        author_avatar:
          p.subredditIcon ||
          "https://api.dicebear.com/7.x/identicon/svg?seed=" + p.author,
        title: p.title,
        content: p.content || "",
        cover_url: p.imageUrl || "",
        like_count:
          parseInt(p.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
        reply_count: parseInt(p.comments) || 0,
        favorite_count: 0,
        published_at: Math.floor(Date.now() / 1000) - 3600 * 4,
        is_liked: false,
        is_favorited: false,
        is_following_author: false,
      }));
    }

    return [
      200,
      {
        items,
        next_cursor: (cursor + 10).toString(),
        has_more: hasMore,
      },
    ];
  });

  // Mock auth
  mock.onPost("/login").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    return [
      200,
      {
        token: "mock-access-token",
        expired_at: Date.now() + 3600000,
        user_id: data.mobile || "mock_user",
        nickname: data.mobile || "Mock User",
      },
    ];
  });

  mock.onPost("/users").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    return [
      200,
      {
        token: "mock-access-token",
        expired_at: Date.now() + 3600000,
        user_id: data.nickname || data.mobile || "mock_user",
        nickname: data.nickname || "Mock User",
      },
    ];
  });

  mock.onPost("/logout").reply(200, {});

  // Mock profile feed
  mock.onPost("/feed/user/publish").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const userId = data.user_id;
    const items = MOckPosts.filter(
      (p) => p.authorId === userId || p.author === userId,
    ).map((p) => ({
      content_id: p.id,
      author_id: p.authorId || p.author,
      author_name: p.author,
      author_avatar:
        p.subredditIcon ||
        "https://api.dicebear.com/7.x/identicon/svg?seed=" + p.author,
      title: p.title,
      content: p.content || "",
      cover_url: p.imageUrl || "",
      like_count:
        parseInt(p.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
      reply_count: parseInt(p.comments) || 0,
      favorite_count: 0,
      published_at: Math.floor(Date.now() / 1000) - 3600 * 4,
      is_liked: !!p.isLiked,
      is_favorited: !!p.isFavorited,
      is_following_author: false,
    }));
    return [200, { items, next_cursor: "", has_more: false }];
  });

  mock.onPost("/feed/user/favorite").reply(() => {
    return [200, { items: [], next_cursor: "", has_more: false }];
  });

  // mock content detail
  const contentDetailRegex = /\/content\/detail/;
  mock.onPost(contentDetailRegex).reply((config) => {
    const data = JSON.parse(config.data || "{}");
    let contentId = data.content_id;
    let post = MOckPosts.find((p) => p.id === contentId);
    if (!post) {
      post = {
        id: contentId,
        subreddit: "webdev",
        author: "mock_author",
        title: "Mock Published Post",
        content: "This is a mock content block.",
        upvotes: "0",
        comments: "0",
        timeAgo: "just now",
      };
    }
    return [
      200,
      {
        content_info: {
          content_id: post.id,
          title: post.title,
          content: post.content || "",
          cover_url: post.imageUrl || "",
          tags: [],
          published_at: Math.floor(Date.now() / 1000) - 3600,
        },
        author_info: {
          user_id: post.authorId || post.author,
          nickname: post.author,
          avatar:
            post.subredditIcon ||
            "https://api.dicebear.com/7.x/identicon/svg?seed=" + post.author,
          bio: "",
          follower_count: 100,
          content_count: 5,
          is_following: false,
        },
        stats: {
          view_count: 1000,
          like_count:
            parseInt(post.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
          reply_count: parseInt(post.comments) || 0,
          favorite_count: 0,
          share_count: 0,
          is_liked: !!post.isLiked,
          is_favorited: !!post.isFavorited,
        },
      },
    ];
  });

  // mock comments
  mock.onPost("/interaction/comment/list").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const contentId = data.content_id;
    const post = MOckPosts.find((p) => p.id === contentId);
    const comments = (post?.commentList || []).map((c) => ({
      comment_id: c.id,
      content_id: contentId,
      comment: c.content,
      created_at: Math.floor(Date.now() / 1000) - 3600,
      user_id: c.author,
      user_name: c.author,
      user_avatar:
        "https://api.dicebear.com/7.x/identicon/svg?seed=" + c.author,
      reply_count: c.replies ? c.replies.length : 0,
      like_count:
        parseInt(c.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
      is_liked: false,
    }));
    return [200, { comments, next_cursor: "", has_more: false }];
  });

  mock.onPost("/interaction/comment/reply/list").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const commentId = data.comment_id;
    let allReplies: any[] = [];
    MOckPosts.forEach((p) => {
      p.commentList?.forEach((c) => {
        if (c.id === commentId && c.replies) {
          allReplies = c.replies.map((r) => ({
            comment_id: r.id,
            content_id: p.id,
            parent_id: commentId,
            comment: r.content,
            reply_to_user_id: (r as any).reply_to_user_id,
            created_at: Math.floor(Date.now() / 1000) - 1000,
            user_id: r.author,
            user_name: r.author,
            user_avatar:
              "https://api.dicebear.com/7.x/identicon/svg?seed=" + r.author,
            reply_count: 0,
            like_count:
              parseInt(r.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
            is_liked: false,
          }));
        }
      });
    });
    return [200, { comments: allReplies, next_cursor: "", has_more: false }];
  });

  // Mock post/comment publish
  mock.onPost("/content/publish").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const { title, content, cover_url } = data;
    const newPost = {
      id: "mock_post_" + Date.now(),
      subreddit: "users",
      author: "me_mock",
      authorId: "me_mock",
      title: title || "Untitled",
      content: content || "",
      imageUrl: cover_url || "",
      upvotes: "0",
      comments: "0",
      timeAgo: "just now",
    };
    MOckPosts.unshift(newPost);
    return [200, { content_id: newPost.id }];
  });

  mock.onPost("/interaction/comment").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const { content_id, comment, root_id, parent_id, reply_to_user_id } = data;
    const post = MOckPosts.find((p) => p.id === content_id);

    let mockUsername = "me_mock";
    try {
      const storage = localStorage.getItem("auth-storage");
      if (storage)
        mockUsername = JSON.parse(storage).state?.user?.nickname || "me_mock";
    } catch (e) {}

    if (post) {
      if (!post.commentList) post.commentList = [];

      const newComment = {
        id: "new_mock_comment_" + Date.now(),
        author: mockUsername,
        content: comment,
        upvotes: "0",
        timeAgo: "just now",
        replies: [],
        reply_to_user_id: reply_to_user_id,
      };

      if (root_id || parent_id) {
        // Find the root comment
        const targetId = root_id || parent_id;
        const parentComment = post.commentList.find((c) => c.id === targetId);
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(newComment);
        } else {
          post.commentList.unshift(newComment);
        }
      } else {
        post.commentList.unshift(newComment);
      }
      post.comments = (parseInt(post.comments || "0") + 1).toString();
    }

    return [200, { comment_id: "new_mock_comment_" + Date.now() }];
  });

  // Mock interactions
  mock.onPost("/interaction/like").reply(200, {});
  mock.onPost("/interaction/unlike").reply(200, {});
  mock.onPost("/interaction/favorite").reply(200, {});
  mock.onDelete("/interaction/favorite").reply(200, {});
  mock.onPost("/interaction/followings").reply(200, { is_followed: true });
  mock.onDelete("/interaction/followings").reply(200, { is_followed: false });

  // Mock deletes
  mock.onDelete("/content").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const idx = MOckPosts.findIndex(p => p.id === data.content_id);
    if (idx !== -1) MOckPosts.splice(idx, 1);
    return [200, {}];
  });

  mock.onDelete("/interaction/comment").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const post = MOckPosts.find(p => p.id === data.content_id);
    if (post && post.commentList) {
       const removeComment = (comments: any[]) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === data.comment_id) {
               comments.splice(i, 1);
               return true;
            }
            if (comments[i].replies && removeComment(comments[i].replies)) {
               return true;
            }
          }
          return false;
       };
       removeComment(post.commentList);
       post.comments = Math.max(0, parseInt(post.comments || "0") - 1).toString();
    }
    return [200, {}];
  });

  // Mock profile
  mock.onGet(/\/user\/profile\/.+/).reply((config) => {
    const userId = config.url?.split("/").pop() || "unknown";
    return [
      200,
      {
        user_profile: {
          user_id: userId,
          nickname: userId,
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=" + userId,
          bio: "Mock user bio",
          gender: 0,
          birthday: "",
        },
        counts: {
          follower_count: 100,
          followee_count: 50,
          content_count: 10,
          like_received_count: 1000,
          favorite_received_count: 500,
        },
        viewer: {
          is_following: false,
        },
      },
    ];
  });

  mock.onGet("/users/me").reply(200, {
    user_info: {
      user_id: "me_mock",
      nickname: "Mock User",
    },
    followee_count: 10,
    follower_count: 10,
    like_received_count: 10,
    favorite_received_count: 10,
    content_count: 10,
  });

  // Any other routes return 200 by default or just pass through
  mock.onAny().passThrough();
}
