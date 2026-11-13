// আপলোড করা ফাইল ভিডিও কিনা (নামের শেষ দেখে)
export const isVideo = (u?: string | null): boolean => /\.(mp4|webm)(\?.*)?$/i.test(u ?? "");
