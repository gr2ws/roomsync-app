import { create } from 'zustand';
import { PropertyFormData } from '../screens/owner/AddPropertyScreen';

interface UploadProgress {
  current: number;
  total: number;
}

interface PropertyUploadState {
  isUploading: boolean;
  progress: UploadProgress;
  uploadData: PropertyFormData | null;
  error: string | null;
  startUpload: (data: PropertyFormData) => void;
  updateProgress: (current: number, total: number) => void;
  completeUpload: () => void;
  failUpload: (error: string) => void;
  resetUpload: () => void;
}

export const usePropertyUpload = create<PropertyUploadState>((set) => ({
  isUploading: false,
  progress: { current: 0, total: 0 },
  uploadData: null,
  error: null,
  startUpload: (data: PropertyFormData) =>
    set({
      isUploading: true,
      uploadData: data,
      progress: { current: 0, total: data.images.length },
      error: null,
    }),
  updateProgress: (current: number, total: number) => set({ progress: { current, total } }),
  completeUpload: () =>
    set({
      isUploading: false,
      uploadData: null,
      progress: { current: 0, total: 0 },
      error: null,
    }),
  failUpload: (error: string) =>
    set({
      isUploading: false,
      error,
      progress: { current: 0, total: 0 },
    }),
  resetUpload: () =>
    set({
      isUploading: false,
      uploadData: null,
      progress: { current: 0, total: 0 },
      error: null,
    }),
}));
