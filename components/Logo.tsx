import React from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/assets/logo.png"
        alt="Logo"
        width={32}
        height={32}
        className="w-10 h-10"
      />
      <span className="text-xl font-bold ml-2 text-white italic">Pithy Means</span>
    </Link>
  );
};

export default Logo;
