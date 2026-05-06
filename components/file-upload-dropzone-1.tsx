"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import axios from "axios"


import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { File02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const title = "Basic Dropzone";

const Example = () => {
  const [files, setFiles] = React.useState<File[]>([]);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onUpload = async (files: File[], { onSuccess, onError, onProgress }: {
    onProgress: (file: File, progress: number) => void;
    onSuccess: (file: File) => void;
    onError: (file: File, error: Error) => void;
  },) => {
    try {
      for (const file of files) {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          file: file
        }, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (e) => {
            const total = e.total || 0;
            const pct = total > 0 ? Math.round((e.loaded / total) * 100) : 0;
            onProgress(file, pct);
          }
        },
        )
        if (data.success) {
          onSuccess(file);
          toast.success(`${file.name} uploaded successfully`)
        } else {
          toast.error(`${file.name} upload failed`)
        }
      }
    } catch (error) {
      toast.error(`Upload failed`)
    }
  }

  return (
    <FileUpload
      maxFiles={100}
      maxSize={100 * 1024 * 1024}
      className="w-full max-w-md"
      value={files}
      onValueChange={setFiles}
      onFileReject={onFileReject}
      multiple
      onUpload={onUpload}
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <HugeiconsIcon icon={File02Icon} className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground">
            Or click to browse
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="bg-primary/50">
            <FileUploadItemProgress className="bg-primary/20" variant="fill" />
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <X className="size-4" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
};

export default Example;
