"use client";

import { Modal } from "../ui/Modal";
import Image from "next/image";
import { Button } from "../ui/Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 확인(삭제) 버튼 클릭 시 호출 */
  onConfirm: () => void;
  /** 삭제 대상 이름 (예: 장소 제목). 있으면 "OOO을(를) 삭제하시겠습니까?" 로 표시 */
  title?: string;
  /** 삭제 진행 중이면 확인 버튼 비활성화 */
  isDeleting?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false,
}: DeleteModalProps) {
  const message = title ? `"${title}"을(를) 삭제하시겠습니까?` : "이 장소를 삭제하시겠습니까?";

  return (
    <Modal
      isOpen={isOpen}
      title=""
      onClose={onClose}
      className="bg-white/80 backdrop-blur-xl border-white/80"
    >
      <div className="flex flex-col items-center text-center">
        {/* 아이콘: 삭제(휴지통) + 컨셉 색 글로우 */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <Image
              src="/icons/ico_delete.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
              aria-hidden
            />
          </div>
        </div>

        <p className="text-base font-medium text-gray-800">{message}</p>
        <p className="mt-1 text-sm text-gray-500">삭제된 장소는 복구할 수 없습니다.</p>

        <div className="mt-6 flex w-full gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-[#5a2fb8]"
          >
            {isDeleting ? "삭제 중…" : "삭제"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
