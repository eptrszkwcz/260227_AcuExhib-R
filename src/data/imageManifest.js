/**
 * Ground-truth manifest for all game images.
 *
 * Two pools:
 *   'acusensus'  — 18 images (easier); used on the Acusensus side / single-player round 1
 *   'competitor' — 24 images (harder);  used on the Competitors side / single-player round 2
 *
 * Image files live in public/images/drivers/ and are served at /images/drivers/<id>.jpg
 *
 * Naming conventions:
 *   Acusensus:  a01.jpg … a18.jpg
 *   Competitor: c01.jpg … c24.jpg
 *
 * label values:
 *   'seatbelt'   — driver is committing a seatbelt violation
 *   'distracted' — driver is committing a distracted driving offence
 *   'safe'       — driver is driving safely
 *
 * TODO: Replace all 'safe' placeholder labels with correct ground-truth values
 *       once images are confirmed.
 */

export const IMAGE_CATEGORIES = ['seatbelt', 'distracted', 'safe']

export const imageManifest = [
  // ------------------------------------------------------------------
  // Acusensus pool — 18 images
  // ------------------------------------------------------------------
  { id: 'a01', src: '/images/drivers/a01.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a02', src: '/images/drivers/a02.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a03', src: '/images/drivers/a03.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a04', src: '/images/drivers/a04.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a05', src: '/images/drivers/a05.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a06', src: '/images/drivers/a06.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a07', src: '/images/drivers/a07.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a08', src: '/images/drivers/a08.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a09', src: '/images/drivers/a09.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a10', src: '/images/drivers/a10.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a11', src: '/images/drivers/a11.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a12', src: '/images/drivers/a12.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a13', src: '/images/drivers/a13.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a14', src: '/images/drivers/a14.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a15', src: '/images/drivers/a15.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a16', src: '/images/drivers/a16.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a17', src: '/images/drivers/a17.jpg', label: 'safe', pool: 'acusensus' },
  { id: 'a18', src: '/images/drivers/a18.jpg', label: 'safe', pool: 'acusensus' },

  // ------------------------------------------------------------------
  // Competitor pool — 24 images (harder to classify)
  // ------------------------------------------------------------------
  { id: 'c01', src: '/images/drivers/c01.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c02', src: '/images/drivers/c02.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c03', src: '/images/drivers/c03.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c04', src: '/images/drivers/c04.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c05', src: '/images/drivers/c05.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c06', src: '/images/drivers/c06.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c07', src: '/images/drivers/c07.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c08', src: '/images/drivers/c08.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c09', src: '/images/drivers/c09.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c10', src: '/images/drivers/c10.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c11', src: '/images/drivers/c11.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c12', src: '/images/drivers/c12.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c13', src: '/images/drivers/c13.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c14', src: '/images/drivers/c14.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c15', src: '/images/drivers/c15.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c16', src: '/images/drivers/c16.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c17', src: '/images/drivers/c17.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c18', src: '/images/drivers/c18.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c19', src: '/images/drivers/c19.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c20', src: '/images/drivers/c20.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c21', src: '/images/drivers/c21.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c22', src: '/images/drivers/c22.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c23', src: '/images/drivers/c23.jpg', label: 'safe', pool: 'competitor' },
  { id: 'c24', src: '/images/drivers/c24.jpg', label: 'safe', pool: 'competitor' },
]

/** All 18 Acusensus images */
export const acusensusImages = imageManifest.filter((img) => img.pool === 'acusensus')

/** All 24 Competitor images */
export const competitorImages = imageManifest.filter((img) => img.pool === 'competitor')

/** O(1) lookup: imageId → correct label. Used by COMPLETE_GAME scoring. */
export const labelByImageId = Object.fromEntries(
  imageManifest.map((img) => [img.id, img.label])
)
