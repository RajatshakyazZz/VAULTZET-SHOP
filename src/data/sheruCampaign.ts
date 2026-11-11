export interface SheruSampleVideo {
  id: string;
  driveFileId?: string;
  videoUrl: string;
  previewEmbedUrl?: string;
  thumbnailUrl: string;
  fallbackThumbnailUrl?: string;
  title: string;
  badge: string;
  type: 'drive' | 'mp4';
}

export interface SheruBonusBundle {
  id: string;
  bonusNumber: number;
  title: string;
  subtitle: string;
  reelCount: number;
  worthPrice: number;
  image: string;
  fallbackImage: string;
  highlights: string[];
  sampleVideos: SheruSampleVideo[];
}

export const SHERU_MAIN_SAMPLE_VIDEOS: SheruSampleVideo[] = [
  {
    id: 'sheru-sample-1',
    driveFileId: '1lcwMxLquXaxoLRISpLV5gxniIYLiP-Jc',
    videoUrl: 'https://drive.google.com/file/d/1lcwMxLquXaxoLRISpLV5gxniIYLiP-Jc/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1lcwMxLquXaxoLRISpLV5gxniIYLiP-Jc/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1lcwMxLquXaxoLRISpLV5gxniIYLiP-Jc=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1lcwMxLquXaxoLRISpLV5gxniIYLiP-Jc&sz=w600',
    title: 'Sample #1 · Viral Sheru Hook',
    badge: '1080P HD',
    type: 'drive',
  },
  {
    id: 'sheru-sample-2',
    driveFileId: '1wLDTiq9minvJ53BxS5_kOhMUPs4nqllG',
    videoUrl: 'https://drive.google.com/file/d/1wLDTiq9minvJ53BxS5_kOhMUPs4nqllG/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1wLDTiq9minvJ53BxS5_kOhMUPs4nqllG/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1wLDTiq9minvJ53BxS5_kOhMUPs4nqllG=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1wLDTiq9minvJ53BxS5_kOhMUPs4nqllG&sz=w600',
    title: 'Sample #2 · Savage Dialogue',
    badge: 'No Watermark',
    type: 'drive',
  },
  {
    id: 'sheru-sample-3',
    driveFileId: '1albAmQHXdGPT6G45xncTCGTKGy5Hg7GG',
    videoUrl: 'https://drive.google.com/file/d/1albAmQHXdGPT6G45xncTCGTKGy5Hg7GG/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1albAmQHXdGPT6G45xncTCGTKGy5Hg7GG/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1albAmQHXdGPT6G45xncTCGTKGy5Hg7GG=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1albAmQHXdGPT6G45xncTCGTKGy5Hg7GG&sz=w600',
    title: 'Sample #3 · Comedy Punchline',
    badge: 'High Retention',
    type: 'drive',
  },
  {
    id: 'sheru-sample-4',
    driveFileId: '15wSHUH60pJJcLZoLzEljMdV2moCozBm5',
    videoUrl: 'https://drive.google.com/file/d/15wSHUH60pJJcLZoLzEljMdV2moCozBm5/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/15wSHUH60pJJcLZoLzEljMdV2moCozBm5/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/15wSHUH60pJJcLZoLzEljMdV2moCozBm5=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=15wSHUH60pJJcLZoLzEljMdV2moCozBm5&sz=w600',
    title: 'Sample #4 · Character Skit',
    badge: 'Trending Audio',
    type: 'drive',
  },
  {
    id: 'sheru-sample-5',
    driveFileId: '12McwmxdAVEOqtdX1WteB74einCclWLSm',
    videoUrl: 'https://drive.google.com/file/d/12McwmxdAVEOqtdX1WteB74einCclWLSm/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/12McwmxdAVEOqtdX1WteB74einCclWLSm/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/12McwmxdAVEOqtdX1WteB74einCclWLSm=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=12McwmxdAVEOqtdX1WteB74einCclWLSm&sz=w600',
    title: 'Sample #5 · Viral Meme Cut',
    badge: 'Ready to Post',
    type: 'drive',
  },
  {
    id: 'sheru-sample-6',
    driveFileId: '1ES30rXPwzvGfYXycIMv34gOBhIOO20oo',
    videoUrl: 'https://drive.google.com/file/d/1ES30rXPwzvGfYXycIMv34gOBhIOO20oo/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1ES30rXPwzvGfYXycIMv34gOBhIOO20oo/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ES30rXPwzvGfYXycIMv34gOBhIOO20oo=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1ES30rXPwzvGfYXycIMv34gOBhIOO20oo&sz=w600',
    title: 'Sample #6 · Sheru Bhai Swag',
    badge: '9:16 Vertical',
    type: 'drive',
  },
];

export const SNAKE_BONUS_SAMPLE_VIDEOS: SheruSampleVideo[] = [
  {
    id: 'snake-bonus-1',
    driveFileId: '1pNQAGu8fixom9r5pkdjZadHKkIrqtESI',
    videoUrl: 'https://drive.google.com/file/d/1pNQAGu8fixom9r5pkdjZadHKkIrqtESI/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1pNQAGu8fixom9r5pkdjZadHKkIrqtESI/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1pNQAGu8fixom9r5pkdjZadHKkIrqtESI=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1pNQAGu8fixom9r5pkdjZadHKkIrqtESI&sz=w600',
    title: 'Snake Bonus #1',
    badge: 'Viral AI Clip',
    type: 'drive',
  },
  {
    id: 'snake-bonus-2',
    driveFileId: '1oDn_kYwhFJnPBedxMWBGBRbt9cqOrs0U',
    videoUrl: 'https://drive.google.com/file/d/1oDn_kYwhFJnPBedxMWBGBRbt9cqOrs0U/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1oDn_kYwhFJnPBedxMWBGBRbt9cqOrs0U/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1oDn_kYwhFJnPBedxMWBGBRbt9cqOrs0U=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1oDn_kYwhFJnPBedxMWBGBRbt9cqOrs0U&sz=w600',
    title: 'Snake Bonus #2',
    badge: '1080P HD',
    type: 'drive',
  },
  {
    id: 'snake-bonus-3',
    driveFileId: '1jLRytuKfXb5XyqPhZpY7MQTXdrHxcG0g',
    videoUrl: 'https://drive.google.com/file/d/1jLRytuKfXb5XyqPhZpY7MQTXdrHxcG0g/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1jLRytuKfXb5XyqPhZpY7MQTXdrHxcG0g/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1jLRytuKfXb5XyqPhZpY7MQTXdrHxcG0g=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1jLRytuKfXb5XyqPhZpY7MQTXdrHxcG0g&sz=w600',
    title: 'Snake Bonus #3',
    badge: 'Reverse World',
    type: 'drive',
  },
  {
    id: 'snake-bonus-4',
    driveFileId: '1UQVZTk-VLixcgVeDAuZUdN_hu0gsr1rj',
    videoUrl: 'https://drive.google.com/file/d/1UQVZTk-VLixcgVeDAuZUdN_hu0gsr1rj/view?usp=drive_link',
    previewEmbedUrl: 'https://drive.google.com/file/d/1UQVZTk-VLixcgVeDAuZUdN_hu0gsr1rj/preview',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1UQVZTk-VLixcgVeDAuZUdN_hu0gsr1rj=w600',
    fallbackThumbnailUrl: 'https://drive.google.com/thumbnail?id=1UQVZTk-VLixcgVeDAuZUdN_hu0gsr1rj&sz=w600',
    title: 'Snake Bonus #4',
    badge: 'Clean MP4',
    type: 'drive',
  },
];

export const STICKMAN_BONUS_SAMPLE_VIDEOS: SheruSampleVideo[] = [
  {
    id: 'stickman-bonus-1',
    videoUrl: 'https://reelsbundles.in/wp-content/uploads/2026/09/gigglee_toons_1787416995_3969463571233179389_28226841059.mp4',
    thumbnailUrl: '/bonus-stickman.png',
    fallbackThumbnailUrl: 'https://reelsbundles.in/wp-content/uploads/2026/10/2500-stickman-animation-reels-bundle-2-1024x768.png',
    title: 'Stickman Viral Preview',
    badge: '1080P Animation',
    type: 'mp4',
  },
];

export const SHERU_BONUSES: SheruBonusBundle[] = [
  {
    id: 'rb-snake-ulti-500',
    bonusNumber: 1,
    title: '500+ Snake Ulti Duniya AI Reels Bundle',
    subtitle: 'Saamp Ki Ulti Duniya / Reverse World Viral AI Reels (Full HD 9:16)',
    reelCount: 500,
    worthPrice: 299,
    image: '/bonus-snake-ulti.png',
    fallbackImage: 'https://reelsbundles.in/wp-content/uploads/2026/10/500-snake-ulti-duniya-reverse-world-ai-reels-bundle-2-768x576.png',
    highlights: [
      '500+ Viral Reverse World AI Snake Reels',
      'Instant Curiosity Hooks for Million Views',
      'Zero Watermark · Pre-Synced Sound',
    ],
    sampleVideos: SNAKE_BONUS_SAMPLE_VIDEOS,
  },
  {
    id: 'rb-stickman-2500',
    bonusNumber: 2,
    title: '2500+ Stickman Animation Reels Bundle',
    subtitle: 'Funny Viral Stick-Figure Story & Relatable Comedy Reels Pack',
    reelCount: 2500,
    worthPrice: 199,
    image: '/bonus-stickman.png',
    fallbackImage: 'https://reelsbundles.in/wp-content/uploads/2026/10/2500-stickman-animation-reels-bundle-2-1024x768.png',
    highlights: [
      '2,500+ Relatable Stickman Comedy Animations',
      'High Share Rate Across Instagram & Shorts',
      '1080P MP4 · Instant Google Drive Access',
    ],
    sampleVideos: STICKMAN_BONUS_SAMPLE_VIDEOS,
  },
];
