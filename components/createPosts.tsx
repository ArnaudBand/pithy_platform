"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { createPost, PostDTO } from "@/lib/actions/post.actions";

interface CreatePostsProps {
  onPostCreated: (newPost: PostDTO) => void;
}

const CreatePosts: React.FC<CreatePostsProps> = ({ onPostCreated }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [videoBase64, setVideoBase64] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max is 50 MB.`
      );
      return;
    }

    setFileSize(file.size);
    const reader = new FileReader();

    reader.onload = () => {
      const data = reader.result as string;
      if (file.type.startsWith("image/")) {
        setImageBase64(data);
        setVideoBase64("");
      } else if (file.type.startsWith("video/")) {
        setVideoBase64(data);
        setImageBase64("");
      } else {
        toast.error("Unsupported file type. Please upload an image or video.");
      }
    };

    reader.onerror = () =>
      toast.error("Failed to read the file. Please try again.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to post.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please add a title to your post.");
      return;
    }

    try {
      setLoading(true);
      const result = await createPost(userId, {
        title: title.trim(),
        content: content.trim() || undefined,
        imageBase64: imageBase64 || undefined,
        videoBase64: videoBase64 || undefined,
      });

      if (!result.success || !result.post) {
        toast.error(result.message ?? "Failed to create post.");
        return;
      }

      setTitle("");
      setContent("");
      setImageBase64("");
      setVideoBase64("");
      setFileSize(0);

      onPostCreated(result.post);
      toast.success("Post published!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Toaster />
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
          <p className="text-white text-xl font-medium animate-pulse">
            Publishing…
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl shadow-xl p-10 space-y-6 border border-gray-200"
      >
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold text-gray-800">
            Create a New Post
          </h2>
          <p className="text-gray-500 text-lg">
            Share your ideas with the community.
          </p>
        </div>

        {/* Title (required) */}
        <div>
          <Label
            htmlFor="post-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title…"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-4 focus:ring-green-400 focus:border-green-500"
            required
          />
        </div>

        {/* Content (optional) */}
        <div>
          <Label
            htmlFor="post-content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </Label>
          <Textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here…"
            className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-4 focus:ring-green-400 focus:border-green-500 p-4 text-gray-800 text-base transition duration-300"
            rows={5}
          />
        </div>

        {/* Media upload */}
        <div>
          <Label
            htmlFor="post-media"
            className="block text-lg font-medium text-gray-700 mb-3"
          >
            Upload Image or Video
          </Label>
          <Input
            id="post-media"
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,video/mp4"
            className="block w-full text-gray-600 text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500/10 file:text-green-600 hover:file:bg-green-100 focus:ring-4 focus:ring-green-400"
          />
          <p className="mt-2 text-sm text-gray-400">
            Supported: JPG, PNG, MP4. Max 50 MB.
            {fileSize > 0 &&
              ` Selected: ${(fileSize / 1024).toFixed(0)} KB`}
          </p>

          {imageBase64 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Image preview:
              </p>
              <Image
                src={imageBase64}
                alt="Preview"
                width={400}
                height={200}
                className="max-h-40 rounded-lg border border-gray-200 object-cover"
                unoptimized
              />
            </div>
          )}

          {videoBase64 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Video preview:
              </p>
              <video
                src={videoBase64}
                controls
                className="mt-1 max-h-40 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish Post
        </Button>
      </form>
    </div>
  );
};

export default CreatePosts;
