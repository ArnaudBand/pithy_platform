"use client";

import {
  BriefcaseBusiness,
  HandCoins,
  LogOut,
  Bell,
  School,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import { GoHome } from "react-icons/go";
import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import { MdOutlineAddCircle } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import CreatePosts from "./createPosts";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth.actions";
import { PostDTO } from "@/lib/actions/post.actions";

function FooterSmallScreen() {
  const [model, setModel] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [posts, setPosts] = useState<PostDTO[]>([]);

  const router = useRouter();

  const handleModel = () => setModel((prev) => !prev);
  const toggleMoreModal = () => setMoreModalOpen((prev) => !prev);

  const addNewPost = (newPost: PostDTO) => {
    setPosts((prev) => [newPost, ...prev]);
    setModel(false);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (moreModalOpen) setMoreModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/human-services/signIn");
    setMoreModalOpen(false);
  };

  return (
    <div>
      {/* Fixed bottom bar for smaller screens */}
      <div className="fixed bottom-0 h-20 w-full block md:hidden bg-[#5AC35A] py-4">
        <div className="flex justify-around items-center text-white">
          <div
            onClick={() => handleNavigate("/human-services/dashboard")}
            className="bg-transparent p-0 hover:bg-transparent cursor-pointer"
            aria-label="Home"
          >
            <div className="flex flex-col items-center">
              <GoHome size={28} className="hover:text-gray-800" />
              <span className="text-xs text-black/70">Home</span>
            </div>
          </div>

          <div
            onClick={() => handleNavigate("/human-services/dashboard/courses")}
            className="bg-transparent p-0 hover:bg-transparent cursor-pointer"
            aria-label="Courses"
          >
            <div className="flex flex-col items-center">
              <HiMiniClipboardDocumentList size={28} className="hover:text-gray-800" />
              <span className="text-xs text-black/70">Courses</span>
            </div>
          </div>

          <div
            onClick={handleModel}
            className="bg-transparent p-0 hover:bg-transparent cursor-pointer"
            aria-label="Create Post"
          >
            <div className="flex flex-col items-center">
              <MdOutlineAddCircle size={28} className="hover:text-gray-800" />
              <span className="text-xs text-black/70">Post</span>
            </div>
          </div>

          <div
            onClick={() => handleNavigate("/human-services/dashboard/jobs")}
            className="bg-transparent p-0 hover:bg-transparent cursor-pointer"
            aria-label="Jobs"
          >
            <div className="flex flex-col items-center">
              <BriefcaseBusiness size={28} className="hover:text-gray-800" />
              <span className="text-xs text-black/70">Jobs</span>
            </div>
          </div>

          <div
            onClick={toggleMoreModal}
            className="bg-transparent p-0 hover:bg-transparent cursor-pointer"
            aria-label="More Options"
          >
            <div className="flex flex-col items-center">
              <MoreHorizontal size={28} className="hover:text-gray-800" />
              <span className="text-xs text-black/70">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {model && (
        <Modal isOpen={model} onClose={handleModel}>
          <CreatePosts onPostCreated={addNewPost} />
        </Modal>
      )}

      {/* More Options Modal */}
      {moreModalOpen && (
        <Modal isOpen={moreModalOpen} onClose={toggleMoreModal}>
          <div className="bg-white/10 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">More Options</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Fundings */}
              <div
                onClick={() => handleNavigate("/human-services/dashboard/fundings")}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <HandCoins size={28} className="text-[#5AC35A]" />
                <span className="text-sm text-white">Funding</span>
              </div>

              {/* Scholarships */}
              <div
                onClick={() => handleNavigate("/human-services/dashboard/scholarships")}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <School size={28} className="text-[#5AC35A]" />
                <span className="text-sm text-white">Scholarships</span>
              </div>

              {/* Profile */}
              <div
                onClick={() => handleNavigate("/human-services/dashboard/profile")}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <IoPersonOutline size={28} className="text-[#5AC35A]" />
                <span className="text-sm text-white">Profile</span>
              </div>

              {/* Notifications */}
              <div
                onClick={() => handleNavigate("/human-services/dashboard/notifications")}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <Bell size={28} className="text-[#5AC35A]" />
                <span className="text-sm text-white">Notifications</span>
              </div>

              {/* Help & Support */}
              <div
                onClick={() => handleNavigate("/human-services/dashboard/help")}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <IoMdHelpCircleOutline size={28} className="text-[#5AC35A]" />
                <span className="text-sm text-white">Help & Support</span>
              </div>

              {/* Logout */}
              <div
                onClick={handleLogout}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <LogOut size={28} className="text-[#F26900]" />
                <span className="text-sm text-[#F26900]">Logout</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FooterSmallScreen;
