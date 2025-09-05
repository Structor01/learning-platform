// src/components/DiscDetailsModal.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import DOMPurify from "dompurify";

const DiscDetailsModal = ({ disc, triggerLabel = "Ver detalhes" }) => {
  const title = disc?.content?.[0]?.title ?? "";
  const rawHtml = disc?.content?.[0]?.content ?? "";
  const safeHtml = DOMPurify.sanitize(rawHtml);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3">{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-900 text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold">
            {title || "Detalhes"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Informações do seu perfil DISC
          </DialogDescription>
        </DialogHeader>

        <div
          className="prose prose-invert max-w-none text-[12px]"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscDetailsModal;
