import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { BUNDLE_PRODUCTS, isSheruBhaiIdentifier } from '@/data/bundles';

export interface ResolvedProductFiles {
  primaryLink: string;
  files: Array<{ id?: string; name: string; file_url: string }>;
}

export function appendSheruBonusesIfNeeded(
  item: { id?: string; slug?: string; title?: string },
  files: Array<{ id?: string; name: string; file_url: string }>
): Array<{ id?: string; name: string; file_url: string }> {
  const isSheru =
    isSheruBhaiIdentifier(item.id) ||
    isSheruBhaiIdentifier(item.slug) ||
    isSheruBhaiIdentifier(item.title);
  if (!isSheru) return files;

  const result = [...files];
  const hasUrlPart = (needle: string) =>
    result.some((f) => String(f.file_url || '').includes(needle));

  if (!hasUrlPart('1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c')) {
    result.push({
      id: 'bonus-snake-ulti',
      name: '🎁 FREE Bonus #1: 500+ Snake Ulti Duniya AI Reels Bundle',
      file_url: 'https://drive.google.com/drive/folders/1CksKkU1ERAuhD9hgBZNP7xP9g068mG-c?usp=sharing',
    });
  }

  if (!hasUrlPart('1yuOoZ2f7P3tdj8ubF_J-hLEkts0jXmW3')) {
    result.push({
      id: 'bonus-stickman-2500',
      name: '🎁 FREE Bonus #2: 2500+ Stickman Animation Reels Bundle',
      file_url: 'https://drive.google.com/drive/folders/1yuOoZ2f7P3tdj8ubF_J-hLEkts0jXmW3?usp=sharing',
    });
  }

  if (!hasUrlPart('1DaIU_BeG5NCj6TfbxABFT_ORhJRcjAid')) {
    result.push({
      id: 'bonus-master-mega',
      name: '🎁 FREE Bonus #3: 10,000+ Ultimate Mega Reels Bundle Pack',
      file_url: 'https://drive.google.com/drive/folders/1DaIU_BeG5NCj6TfbxABFT_ORhJRcjAid?usp=sharing',
    });
  }

  return result;
}

export async function resolveDriveFilesForProduct(item: {
  id?: string;
  slug?: string;
  title?: string;
}): Promise<ResolvedProductFiles> {
  const cleanId = String(item.id || '').trim();
  const cleanSlug = String(item.slug || '').trim().toLowerCase();
  const cleanTitle = String(item.title || '').trim().toLowerCase();

  // 1. Check Firestore products collection directly
  const docLookupKey = cleanSlug || cleanId;
  if (db && docLookupKey) {
    try {
      const snap = await getDoc(doc(db, 'products', docLookupKey));
      if (snap.exists()) {
        const data = snap.data();
        const filesList: any[] = Array.isArray(data.files) && data.files.length > 0
          ? data.files
              .filter((f: any) => f && (f.file_url || f.url))
              .map((f: any, idx: number) => ({
                id: f.id || `file-${idx + 1}`,
                name: f.name || `Drive File ${idx + 1}`,
                file_url: f.file_url || f.url,
              }))
          : [];

        const primaryLink =
          filesList[0]?.file_url ||
          data.google_drive_link ||
          data.googleDriveLink ||
          '';

        if (filesList.length > 0 || (primaryLink && primaryLink.startsWith('http'))) {
          const finalFiles = appendSheruBonusesIfNeeded(
            item,
            filesList.length > 0
              ? filesList
              : [{ name: `${item.title || 'Reels Bundle'} Google Drive Access`, file_url: primaryLink }]
          );
          return {
            primaryLink: primaryLink || finalFiles[0]?.file_url,
            files: finalFiles,
          };
        }
      }
    } catch (e) {
      console.warn('Error reading product doc for drive link:', e);
    }
  }

  // 2. Search Firestore products collection by id, title or slug
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      for (const d of snap.docs) {
        const data = d.data();
        const matchesDocId = Boolean(cleanId && (d.id === cleanId || data.id === cleanId));
        const matchesName = data.name && data.name.toLowerCase() === cleanTitle;
        const matchesSlug =
          data.slug &&
          (data.slug === cleanId ||
            (cleanSlug && data.slug.toLowerCase() === cleanSlug) ||
            cleanTitle.includes(data.slug));
        if (matchesDocId || matchesName || matchesSlug) {
          const filesList: any[] = Array.isArray(data.files) && data.files.length > 0
            ? data.files
                .filter((f: any) => f && (f.file_url || f.url))
                .map((f: any, idx: number) => ({
                  id: f.id || `file-${idx + 1}`,
                  name: f.name || `Drive File ${idx + 1}`,
                  file_url: f.file_url || f.url,
                }))
            : [];

          const primaryLink =
            filesList[0]?.file_url ||
            data.google_drive_link ||
            data.googleDriveLink ||
            '';

          if (filesList.length > 0 || (primaryLink && primaryLink.startsWith('http'))) {
            const finalFiles = appendSheruBonusesIfNeeded(
              item,
              filesList.length > 0
                ? filesList
                : [{ name: `${data.name || item.title || 'Reels Bundle'} Google Drive Access`, file_url: primaryLink }]
            );
            return {
              primaryLink: primaryLink || finalFiles[0]?.file_url,
              files: finalFiles,
            };
          }
        }
      }
    } catch (e) {
      console.warn('Error scanning Firestore products for drive link:', e);
    }
  }

  // 3. Fallback to internal catalog
  const matched = BUNDLE_PRODUCTS.find(
    (b) =>
      b.id === cleanId ||
      b.slug === cleanId ||
      (cleanSlug && b.slug.toLowerCase() === cleanSlug) ||
      b.title.toLowerCase() === cleanTitle ||
      (cleanTitle && cleanTitle.includes(b.slug))
  );

  const matchedLink = matched?.googleDriveLink || 'https://drive.google.com/drive/folders/vaultzet-master-access';
  const matchedFiles = appendSheruBonusesIfNeeded(
    item,
    Array.isArray(matched?.files) && matched.files.length > 0
      ? matched.files
      : [{ name: `${matched?.title || item.title || 'Reels Bundle'} Google Drive Access`, file_url: matchedLink }]
  );

  return {
    primaryLink: matchedLink,
    files: matchedFiles,
  };
}
