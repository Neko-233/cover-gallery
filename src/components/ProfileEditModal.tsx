'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Camera } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          image: data.image || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return; // Prevent submit while uploading
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Force a hard refresh to update session and UI
        window.location.reload();
      } else {
        alert('保存失败');
        setSaving(false);
      }
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('保存失败');
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    setShowUploadStatus(true);

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert('上传图片失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传图片失败');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm min-h-screen">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">编辑个人资料</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">加载中...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                头像
              </label>
              <div className="flex gap-4 items-center">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {formData.image ? (
                      <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <label className={`absolute inset-0 flex items-center justify-center bg-black/50 text-white transition-opacity cursor-pointer rounded-full ${uploading ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}`}>
                    <span className="text-xs">{uploading ? '...' : '更换'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-zinc-500 mb-2">
                    支持 JPG, PNG, GIF。点击头像上传，或直接输入链接。
                  </div>
                  {showUploadStatus ? (
                    <div className="h-[38px] flex items-center px-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                      {uploading ? (
                        <div className="flex items-center gap-2 text-sm text-zinc-500 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                          正在上传头像...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <span>✓</span>
                          上传成功
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="或者输入头像链接..."
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                昵称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={50}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 text-sm"
                placeholder="你的昵称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                简介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 text-sm resize-none"
                placeholder="此人很懒，自我介绍都用了默认皮肤。"
              />
              <div className="text-right text-xs text-zinc-500 mt-1">
                {formData.bio.length}/200
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading || saving}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? '保存中...' : uploading ? '等待上传...' : '保存更改'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
