// dataURL을 Blob으로 변환
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// 모바일 감지
function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Web Share API를 사용한 공유 (모바일)
async function shareImage(dataUrl: string, filename: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'SNPCUT 사진',
      });
      return true;
    }
  } catch (error) {
    // 사용자가 공유를 취소한 경우 등
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
  }
  return false;
}

// 기존 다운로드 방식 (데스크탑)
function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadDataUrlAsFile(dataUrl: string, filename: string): Promise<void> {
  try {
    // 모바일에서는 Web Share API 시도
    if (isMobile()) {
      const shared = await shareImage(dataUrl, filename);
      if (shared) {
        return; // 공유 성공
      }
    }

    // 데스크탑이거나 공유 실패 시 기존 다운로드 방식
    downloadFile(dataUrl, filename);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw new Error("파일 다운로드에 실패했습니다.");
  }
}
