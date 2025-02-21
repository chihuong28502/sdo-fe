import { useEffect, useRef } from "react";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export function InputModal({ isOpen, onClose, onConfirm }: InputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <input
          ref={inputRef}
          type="text"
          placeholder="Nhập yêu cầu của bạn"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onConfirm(inputRef.current!.value);
            }
            if (e.key === "Escape") {
              onClose();
            }
          }}
        />
        <button onClick={() => onConfirm(inputRef.current!.value)}>OK</button>
        <button onClick={onClose}>Hủy</button>
      </div>
    </div>
  );
}
