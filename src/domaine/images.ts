// Compression des photos de documents avant stockage local : une photo brute
// de tablette pèse 3 à 8 Mo ; recadrée à 1600 px en JPEG qualité 0.82 elle
// reste parfaitement lisible pour un document et pèse 5 à 10 fois moins.

const LARGEUR_MAX = 1600

export async function compresserImage(fichier: File | Blob): Promise<Blob> {
  const image = await createImageBitmap(fichier)
  const ratio = Math.min(1, LARGEUR_MAX / Math.max(image.width, image.height))
  const largeur = Math.round(image.width * ratio)
  const hauteur = Math.round(image.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  const contexte = canvas.getContext('2d')
  if (!contexte) throw new Error('Canvas indisponible')
  contexte.drawImage(image, 0, 0, largeur, hauteur)
  image.close()

  return new Promise((resoudre, rejeter) => {
    canvas.toBlob(
      (blob) => (blob ? resoudre(blob) : rejeter(new Error('Compression impossible'))),
      'image/jpeg',
      0.82
    )
  })
}
