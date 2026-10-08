import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"

import "video-react/dist/video-react.css"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const { course } = useSelector((state) => state.course)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const inputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      previewFile(file)
      setSelectedFile(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png"] }
      : { "video/*": [".mp4"] },
    onDrop,
    noClick: true,
  })

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  useEffect(() => {
    register(name, { required: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register])

  useEffect(() => {
    setValue(name, selectedFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, setValue])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-medium text-[#94a3b8]" htmlFor={name}>
        {label} {!viewData && <sup className="text-[#06b6d4]">*</sup>}
      </label>
      <div
        className={`${
          isDragActive
            ? "border-[#06b6d4] bg-[rgba(6,182,212,0.06)]"
            : "border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.03)]"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-[4px] border-2 border-dotted transition-all duration-150`}
      >
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-[4px] object-cover"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-3 text-[#94a3b8] hover:text-[#06b6d4] underline transition-colors duration-150"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div
            className="flex w-full flex-col items-center p-6"
            {...getRootProps({
              onClick: () => {
                open()
              },
            })}
          >
            <input {...getInputProps()} ref={inputRef} />
            <div className="grid aspect-square w-14 place-items-center rounded-[4px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)]">
              <FiUploadCloud className="text-2xl text-[#06b6d4]" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-[#94a3b8]">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span
                className="font-semibold text-[#06b6d4] hover:text-[#0891b2] cursor-pointer transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation()
                  open()
                }}
              >
                Browse
              </span>{" "}
              a file
            </p>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center text-xs text-[#94a3b8]">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-[#06b6d4]">
          {label} is required
        </span>
      )}
    </div>
  )
}