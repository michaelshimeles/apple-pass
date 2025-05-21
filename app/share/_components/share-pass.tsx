"use client";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ApplePass } from "@/lib/types";

export default function SharePass({
  children,
  pass,
  passName,
}: {
  children: ReactNode;
  pass: ApplePass;
  passName?: string;
}) {
  const [passNameEdit, setPassNameEdit] = useState(passName);
  
  useEffect(() => {
    setPassNameEdit(passName);
  }, [passName]);

  return (
    <motion.div
      className="flex flex-col justify-center items-center w-full p-6 h-screen animate-fadeInPage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.h1
        className="text-5xl font-semibold tracking-tight font-[-apple-system,BlinkMacSystemFont] animate-fadeInUp"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {passNameEdit ? passNameEdit : pass.name}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="my-5"
      >
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/api/add/${pass?.slug}`}
          target="_blank"
          className="flex flex-col items-center justify-center gap-2"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Image
              src="/add.png"
              alt="Add to Apple Wallet"
              width={160}
              height={50}
              className="drop-shadow-md"
              quality={95}
            />
          </motion.div>
          <span className="text-xs text-gray-500 mt-2 font-[-apple-system,BlinkMacSystemFont]">
            Tap to add to your Apple Wallet
          </span>
        </Link>
      </motion.div>
      {children}
    </motion.div>
  );
}
