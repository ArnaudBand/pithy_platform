"use client";

import { useState, useEffect } from "react";
import {
  Clipboard,
  Twitter,
  Facebook,
  Youtube,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getProfile, ProfileResponse } from "@/lib/actions/profile.actions";
import { motion } from "framer-motion";
import { CiInstagram } from "react-icons/ci";
import { IoLogoTiktok } from "react-icons/io5";
import { PiSnapchatLogoFill } from "react-icons/pi";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";

const PersonSidebar = () => {
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;
      const result = await getProfile(user.id);
      if (result.success && result.profile) {
        setProfile(result.profile);
      }
    };
    load();
  }, []);

  // Referral link uses the user's email as a fallback identifier
  // (full referral system requires future backend support)
  const referralLink = `https://www.pithymeansplus.com/signUp`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-opacity-20 backdrop-blur-lg bg-white w-[350px] mr-4 mt-6 h-fit text-black justify-start overflow-y-auto rounded-2xl overflow-hidden border border-gray-700 pb-4 shadow-2xl shadow-purple-500/20">
      {/* Gradient Header */}
      <div className="h-20 rounded-t-2xl w-full bg-gradient-to-r from-green-600 via-green-300 to-green-500"></div>

      {/* User Profile Section */}
      <div className="flex flex-col px-6 space-y-4 bg-transparent">
        {profile && (
          <div className="flex flex-col justify-center items-center -mt-10">
            {/* Holographic Avatar */}
            <div className="bg-gradient-to-r from-white/50 to-green-500 rounded-full p-1.5 shadow-lg">
              <div className="bg-gray-900 rounded-full py-2 px-4">
                <p className="text-white text-2xl font-extrabold">
                  {profile.firstName?.charAt(0).toUpperCase() || ""}
                </p>
              </div>
            </div>

            {/* User Name and Category */}
            <div className="text-white items-center flex flex-col space-y-2 mt-3">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-300">
                {profile.firstName} {profile.lastName}
              </span>
              <button className="text-sm bg-black cursor-text rounded shadow shadow-slate-400 px-4 py-1.5 border border-gray-700 hover:bg-gray-700 transition-all">
                {profile.category?.charAt(0).toUpperCase()}
                {profile.category?.slice(1).toLowerCase()}
              </button>
            </div>
          </div>
        )}

        <div className="w-full p-4 bg-white border border-green-400 rounded-3xl shadow-xl relative overflow-hidden mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-[-10px] right-[-10px] text-green-600 animate-pulse"
          >
            <Sparkles size={40} />
          </motion.div>

          <h2 className="text-lg font-extrabold text-green-800 text-center mb-4">
            Share &amp; Invite
          </h2>

          <div className="flex items-center justify-between bg-white p-1.5 rounded-full shadow-md border border-green-300">
            <p className="text-green-700 font-medium truncate text-sm">
              {referralLink}
            </p>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              {copied ? <CheckCircle size={15} /> : <Clipboard size={15} />}
              <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {/* Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20this%20platform:%20${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-black hover:bg-black/80 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <Twitter size={18} />
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <Facebook size={18} />
            </a>

            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=Join%20me%20on%20this%20platform:%20${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <FaWhatsapp size={18} />
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${referralLink}&text=Join%20me%20on%20this%20platform:`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <FaTelegram size={18} />
            </a>

            {/* Gmail */}
            <a
              href={`mailto:?subject=Join%20me%20on%20this%20platform&body=Check%20this%20out:%20${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <BiLogoGmail size={18} />
            </a>

            {/* Instagram */}
            <a
              href={`https://www.instagram.com/?url=${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <CiInstagram size={18} />
            </a>

            {/* Snapchat */}
            <a
              href={`https://www.snapchat.com/scan?attachmentUrl=${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-black py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <PiSnapchatLogoFill size={18} />
            </a>

            {/* TikTok */}
            <a
              href={`https://www.tiktok.com/share?url=${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-black hover:bg-black/80 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <IoLogoTiktok size={18} />
            </a>

            {/* YouTube */}
            <a
              href={`https://www.youtube.com/share?url=${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-full transition-all shadow-lg"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonSidebar;
