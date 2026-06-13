export function fileToUploadInput(file: File): Promise<{ fileName: string; fileType: string; fileBase64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parts = (reader.result as string).split(',');
      const base64 = parts[1] ?? '';
      resolve({
        fileName: file.name,
        fileType: file.type,
        fileBase64: base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
