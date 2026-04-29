export interface Comment {
  id: string;
  author: string;
  content: string;
  upvotes: string;
  timeAgo: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  subreddit: string;
  subredditIcon?: string;
  author: string;
  authorId?: string;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  upvotes: string;
  comments: string;
  timeAgo: string;
  commentList?: Comment[];
  isLiked?: boolean;
  isFavorited?: boolean;
  upvoteCount?: number;
  contentType?: number;
}

export const MOckPosts: Post[] = [
  {
    id: "1",
    subreddit: "webdev",
    author: "frontend_wizard",
    title: "I rebuilt zfeed's UI using modern React and Tailwind CSS. Here's what I learned about their design decisions.",
    content: "It's fascinating how zfeed has evolved over the years. The shift from the classic dense layout to the more modern, card-based approach reveals a lot about user behavior and mobile-first design principles. The new architecture seems heavily reliant on sticky containers, nested scroll regions, and distinct interaction ovals instead of standard buttons...\n\nI found that creating these distinct areas for interactions increases engagement significantly. Has anyone else noticed this trend in other platforms?",
    upvotes: "4.2k",
    comments: "385",
    timeAgo: "4 hr. ago",
    subredditIcon: "https://styles.redditmedia.com/t5_2qs0q/styles/communityIcon_5ycvyvvbpfsp1.png",
    commentList: [
      {
        id: "c1",
        author: "css_hater_99",
        content: "Honestly, the design is super clean. But I still miss the days when we didn't have to wrap everything in 15 levels of border-radius divs.",
        upvotes: "1.2k",
        timeAgo: "3 hr. ago",
        replies: [
          {
            id: "c1-1",
            author: "frontend_wizard",
            content: "I feel you! But component-based design makes it so much easier to maintain.",
            upvotes: "450",
            timeAgo: "2 hr. ago"
          }
        ]
      },
      {
        id: "c2",
        author: "backend_bob",
        content: "Looks great on the surface! How are you handling the infinite scroll and data fetching? That's usually where these clones break down.",
        upvotes: "892",
        timeAgo: "3 hr. ago"
      }
    ]
  },
  {
    id: "2",
    subreddit: "aww",
    author: "dog_lover99",
    title: "My golden retriever learning how to use the modern tech stack. He prefers TypeScript because he's a highly typed good boy.",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1000",
    upvotes: "12.8k",
    comments: "542",
    timeAgo: "6 hr. ago",
    subredditIcon: "https://styles.redditmedia.com/t5_2qh1o/styles/communityIcon_6fzlk8ukx6s51.jpg",
    commentList: [
      {
        id: "c3",
        author: "cat_person",
        content: "He looks like he's about to re-write your entire codebase in Rust.",
        upvotes: "3.4k",
        timeAgo: "5 hr. ago"
      }
    ]
  },
  {
    id: "3",
    subreddit: "programming",
    author: "kernel_panics",
    title: "Why 'Clean Code' is sometimes too clean and causes more problems than it solves in complex distributed systems",
    content: "We've all read the books, but I want to share a controversial opinion: sometimes premature abstractions in the name of 'Clean Code' make debugging a nightmare. When your stack trace bounces through 15 different Single Responsibility classes just to parse a string, we might have lost the plot. Thoughts?",
    upvotes: "8.5k",
    comments: "1.2k",
    timeAgo: "8 hr. ago",
    subredditIcon: "https://styles.redditmedia.com/t5_2fwo/styles/communityIcon_1bqa1ibfp8q11.png"
  },
  {
    id: "4",
    subreddit: "battlestations",
    author: "ergonomic_guy",
    title: "Finally completed my minimal WFH setup. Cable management took an entire weekend.",
    imageUrl: "https://images.unsplash.com/photo-1598425237834-31fd3c706fe5?auto=format&fit=crop&q=80&w=1000",
    upvotes: "3.1k",
    comments: "210",
    timeAgo: "12 hr. ago",
    subredditIcon: "https://styles.redditmedia.com/t5_2riq3/styles/communityIcon_342fscun3x791.png"
  },
  {
    id: "5",
    subreddit: "reactjs",
    author: "hooked_on_hooks",
    title: "What's the consensus on React 19 Actions? Are they entirely replacing our custom useFetch hooks?",
    content: "Been playing around with the new useTransition and action props in React 19. They are incredibly powerful for handling pending states, but I'm wondering if large teams are actively refactoring their entire data fetching architecture to support this, or sticking with established libraries like React Query?",
    upvotes: "1.9k",
    comments: "156",
    timeAgo: "14 hr. ago",
    subredditIcon: "https://styles.redditmedia.com/t5_2zldd/styles/communityIcon_fbblpo38vq941.png"
  }
];

export const TOPICS = [
  "Internet Culture (Viral)",
  "Games",
  "Q&As",
  "Technology",
  "Pop Culture",
  "Movies & TV",
];

export const generateMorePosts = (startIndex: number, count: number): Post[] => {
   return Array.from({ length: count }).map((_, i) => ({
      id: `gen-${startIndex + i}`,
      subreddit: ["technology", "design", "programming", "funny", "gaming"][Math.floor(Math.random() * 5)],
      author: `user_${Math.floor(Math.random() * 10000)}`,
      title: `Generated feed post about topic #${startIndex + i}. Infinite scrolling is working seamlessly!`,
      upvotes: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 9)}k`,
      comments: `${Math.floor(Math.random() * 500)}`,
      timeAgo: `${Math.floor(Math.random() * 24)} hr. ago`,
      content: "This is some auto-generated content to demonstrate the infinite scroll functionality. It uses IntersectionObserver to detect when the user reaches the bottom of the feed and dynamically appends more mock data. It maintains the Sleek Interface visuals consistently.",
   }));
};
