export interface ReviewItem {
  id: string;
  author: string;
  handle: string;
  role: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpful: number;
}

export const STORE_REVIEWS_COUNT = 443;
export const STORE_RATING = '4.9';

export const VERIFIED_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Aarav Mehta',
    handle: '@aarav.creator',
    role: 'Theme Page Creator',
    rating: 5,
    date: '12 Nov 2026',
    verified: true,
    title: 'Google Drive link instant mil gaya! 100% Worth it',
    comment:
      'Payment complete hote hi screen par Drive link open ho gaya aur email par bhi delivery copy aa gayi. Sare videos 1080p full HD vertical format me hain aur koi watermark nahi hai.',
    helpful: 34,
  },
  {
    id: 'rev-2',
    author: 'Pooja Verma',
    handle: '@pooja_digital',
    role: 'Social Media Marketer',
    rating: 5,
    date: '10 Nov 2026',
    verified: true,
    title: 'Roz 3 ghante editing ka time bacha liya',
    comment:
      'Instagram reels ke liye daily content plan banana difficult hota tha. Is bundle se agle 6 mahine ka content ready hai. Quality crisp hai aur format exactly 9:16 vertical shorts ke liye perfect hai.',
    helpful: 28,
  },
  {
    id: 'rev-3',
    author: 'Rohan Joshi',
    handle: '@rohan.growth',
    role: 'Faceless Channel Operator',
    rating: 5,
    date: '8 Nov 2026',
    verified: true,
    title: 'Viral reach 3x ho gayi pehle hi hafte me',
    comment:
      'Clips ke pehle 3 seconds me visual hooks bohot strong hain. Average view duration 85%+ aa raha hai. Folders Google Drive me bohot neatly categorized hain sub-topics me.',
    helpful: 19,
  },
  {
    id: 'rev-4',
    author: 'Sneha Patel',
    handle: '@sneha_content',
    role: 'Lifestyle Creator',
    rating: 5,
    date: '4 Nov 2026',
    verified: true,
    title: 'Safe UPI payment & Lifetime Drive access',
    comment:
      'Cashfree UPI se securely pay kiya aur turant Google Drive folder open ho gaya. Lifetime access mila hai, phone me 1-click download ho jata hai bina kisi watermark ke.',
    helpful: 22,
  },
];
