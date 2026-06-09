import Tesseract from 'tesseract.js';
import type { OCRProgress } from '../types';

export async function recognizeText(
  imageData: string,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    onProgress?.({
      status: 'loading',
      progress: 0,
      message: '正在加载语言包...'
    });

    const result = await Tesseract.recognize(imageData, 'chi_sim+eng', {
      logger: (m) => {
        if (m.status === 'loading tesseract core') {
          onProgress?.({
            status: 'loading',
            progress: m.progress * 30,
            message: '加载识别引擎中...'
          });
        } else if (m.status === 'initializing tesseract') {
          onProgress?.({
            status: 'loading',
            progress: 30 + m.progress * 20,
            message: '初始化识别引擎中...'
          });
        } else if (m.status === 'loading language traineddata') {
          onProgress?.({
            status: 'loading',
            progress: 50 + m.progress * 30,
            message: '加载中文语言包中...'
          });
        } else if (m.status === 'recognizing text') {
          onProgress?.({
            status: 'recognizing',
            progress: 80 + m.progress * 20,
            message: '正在识别文字...'
          });
        }
      }
    });

    onProgress?.({
      status: 'done',
      progress: 100,
      message: '识别完成'
    });

    return result.data.text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    onProgress?.({
      status: 'error',
      progress: 0,
      message: '识别失败，请重试或手动输入'
    });
    throw error;
  }
}
