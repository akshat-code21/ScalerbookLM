"use client";

import { Trash2, X } from "lucide-react";
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

type UploadedFile = {
  name: string;
  originalName: string;
  size: number;
  url: string;
  uploadedAt: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

const Example = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);

  React.useEffect(() => {
    const loadUploadedFiles = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads`);

        if (data.success) {
          setUploadedFiles(data.files);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load uploaded files");
      }
    }

    loadUploadedFiles();
  }, []);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const addUploadedFile = React.useCallback((uploadedFile: UploadedFile) => {
    setUploadedFiles((prevFiles) => [
      uploadedFile,
      ...prevFiles.filter((file) => file.name !== uploadedFile.name),
    ]);
  }, []);

  const deleteUploadedFile = async (file: UploadedFile) => {
    try {
      const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads`, {
        data: {
          name: file.name,
        },
      });

      if (data.success) {
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((prevFile) => prevFile.name !== file.name),
        );
        toast.success(`${file.originalName} deleted`);
      } else {
        toast.error(`${file.originalName} delete failed`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`${file.originalName} delete failed`);
    }
  }

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
          addUploadedFile({
            name: data.name,
            originalName: file.name,
            size: file.size,
            url: `/api/uploads/${encodeURIComponent(data.name)}`,
            uploadedAt: new Date().toISOString(),
          });
          setFiles((prevFiles) => prevFiles.filter((prevFile) => prevFile !== file));
          toast.success(`${file.name} uploaded successfully`)
        } else {
          onError(file, new Error("Upload failed"));
          toast.error(`${file.name} upload failed`)
        }
      }
    } catch (error) {
      for (const file of files) {
        onError(file, error instanceof Error ? error : new Error("Upload failed"));
      }
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
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Uploaded files</p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 rounded-md border bg-primary/20 p-3 text-sm transition-colors hover:bg-primary/30"
              >
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <HugeiconsIcon icon={File02Icon} className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{file.originalName}</span>
                    <span className="block text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                  </span>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  aria-label={`Delete ${file.originalName}`}
                  onClick={() => deleteUploadedFile(file)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </FileUpload>
  );
};

export default Example;
