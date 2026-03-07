import { Modal } from "../ui/Modal";
import Image from "next/image";
import { Button } from "../ui/Button";

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompleteModal({ isOpen, onClose }: CompleteModalProps) {
  return (
    <Modal isOpen={isOpen} title="" onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        {/* 아이콘 영역: 은은한 글로우 + 흰 원 + ico_map.svg */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-[#6f62cb]/25 blur-2xl" aria-hidden />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <Image
              src="/icons/ico_check.svg"
              alt="완료 아이콘"
              width={28}
              height={28}
              className="h-7 w-7"
              aria-hidden
            />
          </div>
        </div>

        {/* 제목 */}
        <h2 className="text-lg font-bold text-gray-800">장소 저장이 완료되었습니다.</h2>

        {/* 하단 버튼: 확인(6f62cb) */}
        <div className="mt-6 flex w-full gap-3">
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6357b8]"
          >
            확인
          </Button>
        </div>
      </div>
    </Modal>
  );
}
