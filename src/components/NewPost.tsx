'use client';

import { AuthUser } from '@/model/user';
import PostUserAvatar from './PostUserAvatar';
import FilesIcon from './ui/icons/FilesIcon';
import Button from './ui/Button';
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GridSpinner from './ui/GridSpinner';
import ImageSlide from './ui/ImageSlide';

type Props = {
  user: AuthUser;
};
export default function NewPost({ user: { username, image } }: Props) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileList | null>();
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const selectFiles: FileList | null = e.target?.files;

    // console.log('파일직접선택시');

    if (selectFiles == null) return;
    setFiles(selectFiles);

    const urls: string[] = Array.from(selectFiles).map((file: File) => {
      return URL.createObjectURL(file); // 각 파일에 대한 URL 생성
    });
    setFileUrls(urls);
  };
  const handleDrag = (e: React.DragEvent) => {
    if (e.type === 'dragenter') {
      setDragging(true);
    } else if (e.type === 'dragleave') {
      setDragging(false);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const selectFiles: FileList | null = e.dataTransfer?.files;
    // console.log('파일드랍시');

    if (selectFiles == null) return;
    setFiles(selectFiles);

    const urls: string[] = Array.from(selectFiles).map((file: File) => {
      return URL.createObjectURL(file); // 각 파일에 대한 URL 생성
    });
    setFileUrls(urls);
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!files) return;

    const formData = new FormData();

    let nameArr: Array<string> = [];

    formData.append('text', textRef.current?.value ?? '');
    formData.append('length', files.length.toString());
    for (let i = 0; i < files.length; i++) {
      formData.append(`number${i}`, files[i], files[i].name);
      nameArr.push(files[i].name);
    }
    formData.append('fileName', nameArr.toString());

    // console.log('섭밋');

    setLoading(true);

    fetch('/api/posts/', { method: 'POST', body: formData })
      .then((res) => {
        if (!res.ok) {
          setError(`${res.status} ${res.statusText}`);
          return;
        }
        router.push('/');
      })
      .catch((err) => setError(err.toString()))
      .finally(() => setLoading(false));
  };

  const handleCancel = (e: MouseEvent) => {
    e.preventDefault();
    if (confirm('업로드를 취소 하시겠습니까?')) {
      setFiles(undefined);
      setFileUrls([]);
      if (textRef.current) {
        textRef.current.value = '';
      }
    }
  };

  return (
    <section className="w-full max-w-xl flex flex-col items-center mt-6 px-4">
      {loading && (
        <div className="absolute inset-0 z-20 text-center pt-[30%] bg-sky-500/20">
          <GridSpinner />
        </div>
      )}
      {error && <p className="w-full bg-red-100 text-red-600 text-center p-4 mb-4 font-bold">{error}</p>}
      <PostUserAvatar username={username} image={image ?? ''} />
      <form className="w-full flex flex-col mt-2 mb-4" onSubmit={handleSubmit}>
        <input
          className="hidden"
          type="file"
          name="input"
          id="input-upload"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
        <label
          className={`w-full h-60 flex flex-col items-center justify-center mb-4 
          ${(files === undefined || files?.length !== 0) && 'border-2 border-sky-500 border-dashed'}
          ${files !== undefined && 'hidden'}
          `}
          htmlFor="input-upload"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {dragging && <div className="absolute inset-0 z-10 bg-sky-500/20 pointer-events-none" />}
          {!files && (
            <div className="flex flex-col items-center pointer-events-none">
              <FilesIcon />
              <p className="text-center">Drag and Drop tour image here or click</p>
            </div>
          )}
        </label>
        {fileUrls && fileUrls.length > 0 && (
          <div className={`w-full h-60 flex flex-col items-center justify-center relative mb-4`}>
            <button
              className="
                absolute z-[5] top-0 right-0 w-[75px] h-[50px] 
                text-white font-bold bg-slate-950/50
              "
              onClick={(e) => handleCancel(e)}
            >
              cancel
            </button>
            <ImageSlide>
              {fileUrls.map((fileUrl) => (
                <div className="w-full h-full aspect-square relative" key={fileUrl}>
                  <Image className="object-contain" src={fileUrl} alt="local file" fill sizes="650px" />
                </div>
              ))}
            </ImageSlide>
          </div>
        )}
        <textarea
          className="w-full h-60 p-2 outline-none text-lg border border-neutral-300 mb-4"
          name="text"
          id="input-text"
          required
          rows={10}
          placeholder={'Write a caption...'}
          ref={textRef}
        />
        <Button text="Upload" onClick={() => {}} />
      </form>
    </section>
  );
}
