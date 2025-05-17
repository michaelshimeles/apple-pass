"use client";

import { motion } from "motion/react";
import QRCode from "@/app/dashboard/_components/qr-code";
import { ApplePass } from "@/lib/types";

export default function Pass({ pass }: { pass: ApplePass }) {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="rounded shadow-xl overflow-hidden text-white font-[-apple-system,BlinkMacSystemFont]"
        style={{
          backgroundColor: pass.backgroundColor!,
          width: 350,
          height: 450,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-between items-center font-semibold mb-4 pt-[20px] px-[20px]">
          <div className="flex items-center gap-2 text-xs">
            {pass.logoUrl && (
              <img
                src={pass.logoUrl}
                alt="logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold tracking-tight">
              {pass.headerFieldLabel || "Header Field Label"}
            </div>
            <div className="text-md font-medium">
              {pass.headerFieldValue || "Header Field Value"}
            </div>
          </div>
        </div>
        <div>
          <div className="w-full h-28 bg-zinc-900 mb-4 flex items-center justify-center overflow-hidden">
            {pass.thumbnailUrl ? (
              <img
                src={pass.thumbnailUrl}
                alt="thumbnail"
                width={144}
                height={144}
                className="w-full h-full object-cover object-center drop-shadow-sm"
                style={{ imageRendering: "auto" }}
              />
            ) : (
              <span className="text-white text-xs">[thumbnail image]</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold rounded-lg backdrop-blur-sm px-[20px]">
          <div>
            <div className="font-semibold tracking-tight">
              {pass.secondaryLeftLabel || "Secondary Left Label"}
            </div>
            <div className="font-medium text-lg">
              {pass.secondaryLeftValue || "Left Value"}
            </div>
          </div>
          <div>
            <div className="font-semibold tracking-tight">
              {pass.secondaryRightLabel || "Secondary Right Label"}
            </div>
            <div className="font-medium text-lg">
              {pass.secondaryRightValue || "Right Value"}
            </div>
          </div>
        </div>
        {pass.barcodeFormat && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col items-center mb-[14rem] justify-center bg-white p-3 rounded-lg shadow-sm">
              <QRCode pass={pass as ApplePass} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
