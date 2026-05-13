/**
 * Client-side utility to compress images before uploading to reduce payload size and optimize hosting.
 */

export const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = (err) => reject(err);
        reader.onload = (ev) => {
            const img = new Image();
            img.src = ev.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max constraint
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    return resolve(ev.target?.result as string); // fallback to original if canvas ctx fails
                }

                ctx.drawImage(img, 0, 0, width, height);
                
                // Preserve transparency for png, webp, gif
                const isTransparent = file.type.includes('png') || file.type.includes('webp') || file.type.includes('gif');
                const mimeType = isTransparent ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
    });
};

