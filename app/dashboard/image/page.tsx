"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Chat() {
  const [viewImage, setViewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const response = await fetch("/api/image", {
      method: "POST",
      body: JSON.stringify({
        prompt: data?.prompt,
      }),
    });

    console.log("response", response);

    const { image } = await response.json();

    const imageSrc = `data:image/png;base64,${image?.base64Data}`;
    console.log("imageSrc", imageSrc);
    setViewImage(imageSrc);
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full py-24 justify-center items-center">
      {viewImage && (
        <div className="flex flex-col gap-3 max-w-[400px]">
          <img src={viewImage} className="rounded" />
          <Link href={viewImage} download="image.png">
            <Button>Download</Button>
          </Link>
        </div>
      )}
      <form
        className="flex gap-2 justify-center w-full items-center fixed bottom-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2 justify-center items-start mb-8 max-w-xl w-full border p-2 rounded-lg bg-white ">
          <Textarea
            className="w-full border-0 shadow-none !ring-transparent resize-none"
            {...register("prompt", { required: true })}
            placeholder="Say something..."
          />
          <div className="flex justify-end gap-3 items-center w-full">
            <Button size="sm" className="text-xs" disabled={loading}>
              {loading ? "Cooking..." : "Send"}
            </Button>
          </div>
          {errors.exampleRequired && <span>This field is required</span>}
        </div>
      </form>
    </div>
  );
}
