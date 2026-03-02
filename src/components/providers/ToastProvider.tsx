"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * ToastProvider 컴포넌트
 *
 * react-toastify의 ToastContainer를 제공하는 컴포넌트
 * 전역에서 토스트 알림을 사용할 수 있도록 합니다.
 */
export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="toast-container text-[14px]"
    />
  );
}
