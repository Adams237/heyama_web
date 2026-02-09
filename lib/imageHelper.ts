export interface CompressionOptions {
  maxWidth?: number;        // Largeur maximale (px)
  maxHeight?: number;       // Hauteur maximale (px)
  quality?: number;         // Qualité de compression (0.1 à 1)
  maxSizeKB?: number;       // Taille maximale en KB
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'; // Format de sortie
}

export const convertFileToBase64 = (
  file: File, 
  options: CompressionOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Options par défaut
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      maxSizeKB = 500,
      outputFormat = 'image/jpeg'
    } = options;

    // Vérifier si c'est une image
    if (!file.type.startsWith('image/')) {
      // Si ce n'est pas une image, retourner le fichier normalement
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      return;
    }

    // Vérifier la taille maximale
    if (maxSizeKB && file.size > maxSizeKB * 1024) {
      console.log(`Image trop volumineuse (${Math.round(file.size / 1024)}KB), compression...`);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (error) => reject(error);

    img.onload = () => {
      // Calculer les nouvelles dimensions en conservant le ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Créer un canvas pour redimensionner et compresser
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Compresser l'image
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Échec de la compression'));
            return;
          }

          // Vérifier la taille après compression
          if (maxSizeKB && blob.size > maxSizeKB * 1024) {
            // Si toujours trop grand, réduire la qualité
            const newQuality = Math.max(0.1, quality * (maxSizeKB * 1024) / blob.size);
            canvas.toBlob(
              (compressedBlob) => {
                if (!compressedBlob) {
                  reject(new Error('Échec de la compression secondaire'));
                  return;
                }
                convertBlobToBase64(compressedBlob).then(resolve).catch(reject);
              },
              outputFormat,
              newQuality
            );
          } else {
            convertBlobToBase64(blob).then(resolve).catch(reject);
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
    
    reader.readAsDataURL(file);
  });
};

// Fonction utilitaire pour convertir un Blob en Base64
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Fonction spécialisée pour la compression d'images
export const compressAndConvertImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<{
  base64: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  compressionRatio: number;
}> => {
  const originalSize = file.size;
  
  const base64 = await convertFileToBase64(file, options);
  
  // Extraire la taille du base64 (environ 1.37x la taille binaire)
  const base64Length = base64.split(',')[1]?.length || 0;
  const compressedSize = Math.floor(base64Length * 0.75); // Approximation
  
  // Créer une image pour obtenir les dimensions
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = base64;
  });

  return {
    base64,
    originalSize,
    compressedSize,
    width: img.width,
    height: img.height,
    compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1
  };
};

// Exemple d'utilisation :
/*
// Compression basique
convertFileToBase64(imageFile, {
  maxWidth: 800,
  maxHeight: 600,
  quality: 0.7,
  maxSizeKB: 200
}).then(base64 => {
  console.log('Image compressée:', base64.substring(0, 100) + '...');
});

// Compression avancée avec informations
compressAndConvertImage(imageFile, {
  maxWidth: 1200,
  quality: 0.8,
  outputFormat: 'image/webp'
}).then(result => {
  console.log(`Taille originale: ${result.originalSize / 1024}KB`);
  console.log(`Taille compressée: ${result.compressedSize / 1024}KB`);
  console.log(`Ratio: ${Math.round(result.compressionRatio * 100)}%`);
  console.log(`Dimensions: ${result.width}x${result.height}`);
});
*/

// Hook React personnalisé pour l'upload avec compression
export const useImageUpload = () => {
  const uploadImage = async (file: File, options?: CompressionOptions) => {
    try {
      const result = await compressAndConvertImage(file, options);
      
      // Ici, vous pouvez envoyer le base64 à votre API
      // await api.uploadImage(result.base64);
      
      return {
        success: true,
        data: result,
        message: `Image compressée: ${Math.round(result.compressionRatio * 100)}% de la taille originale`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  return { uploadImage };
};