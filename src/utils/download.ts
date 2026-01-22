export function downloadDataUrlAsFile(dataUrl: string, filename: string): void {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw new Error("파일 다운로드에 실패했습니다.");
  }
}
