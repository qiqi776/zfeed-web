import MockAdapter from "axios-mock-adapter";
import { api } from "./axios";
import { MOckPosts, generateMorePosts } from "../data/mockData";
import { useAuthStore } from "../store/useAuthStore";

export function setupMockApi() {
  const mock = new MockAdapter(api, { delayResponse: 500 });
  const followedUsers = new Set<string>();
  const userFollowerCounts = new Map<string, number>();

  let mockMe = {
    user_id: "me_mock",
    nickname: "Mock User",
    bio: "Mock bio",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=mock",
  };

  mock.onPost("/feed/follow").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const cursor = parseInt(data.cursor || "0", 10);
    const hasMore = cursor < 30;

    let items = [];
    if (cursor === 0) {
      items = MOckPosts.slice(0, 2).map((p) => ({
        content_id: p.id + "-follow",
        author_id: p.authorId || p.author,
        author_name: p.author,
        author_avatar:
          p.subredditIcon ||
          "https://api.dicebear.com/7.x/identicon/svg?seed=" + p.author,
        title: "[Following] " + p.title,
        content: p.content || "",
        cover_url: p.imageUrl || "",
        like_count:
          parseInt(p.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
        reply_count: parseInt(p.comments) || 0,
        favorite_count: 0,
        published_at: Math.floor(Date.now() / 1000) - 3600 * 4,
        is_liked: !!p.isLiked,
        is_favorited: !!p.isFavorited,
        is_following_author: true,
      }));
    } else {
      items = generateMorePosts(cursor, 10).map((p) => ({
        content_id: p.id + "-follow",
        author_id: p.authorId || p.author,
        author_name: p.author,
        author_avatar:
          p.subredditIcon ||
          "https://api.dicebear.com/7.x/identicon/svg?seed=" + p.author,
        title: "[Following] " + p.title,
        content: p.content || "",
        cover_url: p.imageUrl || "",
        like_count:
          parseInt(p.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
        reply_count: parseInt(p.comments) || 0,
        favorite_count: 0,
        published_at: Math.floor(Date.now() / 1000) - Math.random() * 86400,
        is_liked: !!p.isLiked,
        is_favorited: !!p.isFavorited,
        is_following_author: true,
      }));
    }

    return [
      200,
      {
        items,
        next_cursor: (cursor + 10).toString(),
        has_more: hasMore,
        snapshot_id: "mock_snapshot_follow",
      },
    ];
  });

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
        user_id: "me_mock",
        nickname: mockMe.nickname,
        avatar: mockMe.avatar
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
        user_id: "me_mock",
        nickname: data.nickname || mockMe.nickname,
        avatar: mockMe.avatar
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
        content_id: post.id,
        content_type: 1, // 1 for article
        author_id: post.authorId || post.author,
        author_name: post.author,
        author_avatar:
          post.subredditIcon ||
          "https://api.dicebear.com/7.x/identicon/svg?seed=" + post.author,
        title: post.title,
        description: post.content || "",
        cover_url: post.imageUrl || "",
        article_content: post.content || "",
        video_url: "",
        video_duration: 0,
        published_at: Math.floor(Date.now() / 1000) - 3600,
        like_count:
          parseInt(post.upvotes.replace(/k/, "000").replace(/\./, "")) || 0,
        favorite_count: 0,
        comment_count: parseInt(post.comments) || 0,
        is_liked: !!post.isLiked,
        is_favorited: !!post.isFavorited,
        is_following_author: followedUsers.has(post.authorId || post.author),
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
  mock.onPost("/content/article/publish").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const { title, content, cover } = data;
    const currentUser = useAuthStore.getState().user;
    const authorId = currentUser?.user_id || "me_mock";
    const authorName = currentUser?.nickname || "me_mock";
    const newPost: Post = {
      id: "mock_post_" + Date.now(),
      subreddit: "users",
      subredditIcon: currentUser?.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=" + authorName,
      author: authorName,
      authorId: authorId,
      title: title || "Untitled",
      content: content || "",
      imageUrl: cover || "",
      upvotes: "0",
      comments: "0",
      time: "just now",
      contentType: 10,
    };
    MOckPosts.unshift(newPost);
    return [200, { content_id: newPost.id }];
  });

  mock.onPost("/content/video/publish").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const { title, video_url, cover_url } = data;
    const currentUser = useAuthStore.getState().user;
    const authorId = currentUser?.user_id || "me_mock";
    const authorName = currentUser?.nickname || "me_mock";
    const newPost: Post = {
      id: "mock_post_" + Date.now(),
      subreddit: "users",
      subredditIcon: currentUser?.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=" + authorName,
      author: authorName,
      authorId: authorId,
      title: title || "Untitled",
      videoUrl: video_url || "",
      imageUrl: cover_url || "",
      upvotes: "0",
      comments: "0",
      time: "just now",
      contentType: 20,
    };
    MOckPosts.unshift(newPost);
    return [200, { content_id: newPost.id }];
  });

  mock.onPut(/\/content\/article\/.+/).reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const id = config.url?.split("/").pop();
    const post = MOckPosts.find(p => p.id === id);
    if (post) {
       if (data.title) post.title = data.title;
       if (data.content) post.content = data.content;
       if (data.cover) post.imageUrl = data.cover;
    }
    return [200, { content_id: id }];
  });

  mock.onPut(/\/content\/video\/.+/).reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const id = config.url?.split("/").pop();
    const post = MOckPosts.find(p => p.id === id);
    if (post) {
       if (data.title) post.title = data.title;
       if (data.video_url !== undefined) post.videoUrl = data.video_url;
       if (data.cover_url !== undefined) post.imageUrl = data.cover_url;
    }
    return [200, { content_id: id }];
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

  mock.onPost("/interaction/followings").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    if (data.target_user_id) {
       followedUsers.add(data.target_user_id);
       const current = userFollowerCounts.get(data.target_user_id) || 100;
       userFollowerCounts.set(data.target_user_id, current + 1);
    }
    return [200, { is_followed: true }];
  });
  mock.onDelete("/interaction/followings").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    if (data.target_user_id) {
       followedUsers.delete(data.target_user_id);
       const current = userFollowerCounts.get(data.target_user_id) || 100;
       userFollowerCounts.set(data.target_user_id, Math.max(0, current - 1));
    }
    return [200, { is_followed: false }];
  });

  // Mock deletes
  mock.onDelete("/content").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const idx = MOckPosts.findIndex((p) => p.id === data.content_id);
    if (idx !== -1) MOckPosts.splice(idx, 1);
    return [200, {}];
  });

  mock.onDelete("/interaction/comment").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const post = MOckPosts.find((p) => p.id === data.content_id);
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
      post.comments = Math.max(
        0,
        parseInt(post.comments || "0") - 1,
      ).toString();
    }
    return [200, {}];
  });

  // Mock profile
  mock.onGet(/\/user\/profile\/.+/).reply((config) => {
    const userId = config.url?.split("/").pop() || "unknown";
    const currentUserId = useAuthStore.getState().user?.user_id;
    const isMe = userId === currentUserId || userId === "me_mock";

    const userContentCount = MOckPosts.filter((p) => p.authorId === userId || p.author === userId).length;
    return [
      200,
      {
        user_profile: {
          user_id: userId,
          nickname: isMe ? mockMe.nickname : userId,
          avatar: isMe
            ? mockMe.avatar
            : "https://api.dicebear.com/7.x/identicon/svg?seed=" + userId,
          bio: isMe ? mockMe.bio : "Mock user bio",
          gender: 0,
          birthday: "",
        },
        counts: {
          follower_count: userFollowerCounts.get(userId) || 100,
          followee_count: 50,
          content_count: userContentCount,
          like_received_count: 1000,
          favorite_received_count: 500,
        },
        viewer: {
          is_following: followedUsers.has(userId),
        },
      },
    ];
  });

  mock.onGet("/users/me").reply(() => {
    const userId = useAuthStore.getState().user?.user_id || mockMe.user_id;
    const userContentCount = MOckPosts.filter((p) => p.authorId === userId || p.author === userId).length;
    return [
      200,
      {
        user_info: mockMe,
        followee_count: 50,
        follower_count: userFollowerCounts.get(userId) || 100,
        like_received_count: 1000,
        favorite_received_count: 500,
        content_count: userContentCount,
      },
    ];
  });

  mock.onPut("/users/me/profile").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    if (data.nickname) mockMe.nickname = data.nickname;
    if (data.bio) mockMe.bio = data.bio;
    if (data.avatar) mockMe.avatar = data.avatar;

    return [200, mockMe];
  });

  mock.onPost("/users/avatar/upload").reply(200, {
    url: "https://api.dicebear.com/7.x/identicon/svg?seed=new_avatar",
    object_key: "mock_avatar_key",
  });

  mock.onPost("/user/followings").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const userId = data.user_id;
    // We only care for current user right now
    const items = Array.from(followedUsers).map(id => ({
      user_id: id,
      nickname: id, // mock nickname
      avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=" + id,
      bio: "Following this user"
    }));
    return [
      200,
      {
        items,
        next_cursor: "",
        has_more: false
      }
    ];
  });

  mock.onPost("/user/followers").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const userId = data.user_id;
    return [
      200,
      {
        items: [
          {
            user_id: "follower_1",
            nickname: "Follower One",
            avatar:
              "https://api.dicebear.com/7.x/identicon/svg?seed=follower_1",
            bio: "Hello world",
          },
          {
            user_id: "follower_2",
            nickname: "Follower Two",
            avatar:
              "https://api.dicebear.com/7.x/identicon/svg?seed=follower_2",
            bio: "React fan",
          },
        ],
        next_cursor: "",
        has_more: false,
      },
    ];
  });

  mock.onPost("/search/users").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const query = data.query || "";
    if (!query.trim()) {
       return [200, { items: [], next_cursor: "", has_more: false }];
    }
    
    // Create a mock user based on the query, and include mockMe if it matches
    const items = [];
    if (mockMe.nickname.toLowerCase().includes(query.toLowerCase())) {
        items.push({
            user_id: mockMe.user_id,
            nickname: mockMe.nickname,
            avatar: mockMe.avatar,
            bio: mockMe.bio,
            is_following: followedUsers.has(mockMe.user_id)
        });
    }
    
    // Add some random matching users based on the query
    items.push({
        user_id: `search_user_${Date.now()}_1`,
        nickname: `${query} fan`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${query}1`,
        bio: `Loves ${query}`,
        is_following: false
    });
    
    return [200, { items, next_cursor: "", has_more: false }];
  });

  mock.onPost("/search/contents").reply((config) => {
    const data = JSON.parse(config.data || "{}");
    const query = data.query || "";
    if (!query.trim()) {
       return [200, { items: [], next_cursor: "", has_more: false }];
    }
    
    const items = MOckPosts.filter(
        p => p.title.toLowerCase().includes(query.toLowerCase()) || 
             (p.content && p.content.toLowerCase().includes(query.toLowerCase()))
    ).map(p => ({
        content_id: p.id,
        content_type: p.contentType || (p.videoUrl ? 20 : 10),
        author_id: p.authorId || p.author,
        author_name: p.author,
        author_avatar: p.subredditIcon || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.author}`,
        title: p.title,
        cover_url: p.imageUrl || "",
        published_at: Math.floor(Date.now() / 1000) - 3600 // fake time
    }));

    // If empty result, add a mock result so there's always something
    if (items.length === 0) {
        items.push({
            content_id: `mock_search_${Date.now()}`,
            content_type: 10,
            author_id: "search_author",
            author_name: "Search Author",
            author_avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${query}`,
            title: `Result for ${query}`,
            cover_url: "",
            published_at: Math.floor(Date.now() / 1000)
        });
    }
    
    return [200, { items, next_cursor: "", has_more: false }];
  });

  // Any other routes return 200 by default or just pass through
  mock.onAny().passThrough();
}
