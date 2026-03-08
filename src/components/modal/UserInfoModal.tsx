"use client";

import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/db/schema";

const GENDER_LABELS: Record<NonNullable<User["gender"]>, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
};

function formatBirthDate(value: string | null | undefined): string {
  if (!value) return "미입력";
  const d = typeof value === "string" ? value : String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return d;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  const user = useAuthStore((s) => s.user);

  const email = user?.email ?? "-";
  const name = user?.name ?? "-";
  const birthDate = formatBirthDate(user?.birthDate ?? null);
  const genderLabel = user?.gender ? GENDER_LABELS[user.gender] : "미입력";

  return (
    <Modal isOpen={isOpen} title="내 정보" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <dl className="grid gap-3 text-left">
          <div>
            <dt className="text-sm font-medium uppercase tracking-wider text-gray-500">
              가입한 계정
            </dt>
            <dd className="mt-0.5 text-md font-medium text-gray-800">{email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium uppercase tracking-wider text-gray-500">
              가입한 이름
            </dt>
            <dd className="mt-0.5 text-md font-medium text-gray-800">{name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium uppercase tracking-wider text-gray-500">생년월일</dt>
            <dd className="mt-0.5 text-md font-medium text-gray-800">{birthDate}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium uppercase tracking-wider text-gray-500">성별</dt>
            <dd className="mt-0.5 text-md font-medium text-gray-800">{genderLabel}</dd>
          </div>
        </dl>

        <div className="mt-2 flex w-full gap-3">
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
