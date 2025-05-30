"use client";

import QRCode from "@/app/dashboard/_components/qr-code";
import { ApplePass } from "@/lib/types";
import { motion } from "motion/react";

export default function Pass({ pass }: { pass: ApplePass }) {
  return (
    <motion.div
      className={`flex items-center justify-center`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={
          "rounded-md shadow-xl overflow-hidden font-[-apple-system,BlinkMacSystemFont]"
        }
        style={{
          backgroundColor: pass.background_color!,
          width: 350,
          height: 450,
          color: pass?.text_color,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-between items-start font-semibold mb-4 pt-[6px] px-[10px]">
          <div className="flex items-center justify-start">
            {pass.logo_url && (
              <img
                src={pass.logo_url}
                alt="logo"
                width={32}
                height={32}
                className="w-10 h-10 object-contain"
              />
            )}
          </div>
          <div className="flex flex-col text-right">
            <div className="text-[10px] font-semibold tracking-tight">
              {pass.header_field_label || "Header Field Label"}
            </div>
            <div className="text-[12px] font-medium">
              {pass.header_field_value || "Header Field Value"}
            </div>
          </div>
        </div>
        <div>
          <div className="w-full h-28 bg-zinc-900 mb-4 flex items-center justify-center overflow-hidden">
            {pass.strip_image ? (
              <img
                src={pass.strip_image}
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
        <div className="flex justify-between items-center text-sm font-semibold rounded-lg backdrop-blur-sm px-[10px]">
          <div>
            <div className="font-semibold text-xs tracking-tight">
              {pass.secondary_left_label || "Secondary Left Label"}
            </div>
            <div className="font-normal text-xl">
              {pass.secondary_left_value || "Left Value"}
            </div>
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight">
              {pass.secondary_right_label || "Secondary Right Label"}
            </div>
            <div className="font-normal text-xl">
              {pass.secondary_right_value || "Right Value"}
            </div>
          </div>
        </div>
        {pass.barcode_format && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col items-center mb-[10.5rem] justify-center bg-white p-3 rounded shadow-sm">
              <QRCode pass={pass as ApplePass} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
