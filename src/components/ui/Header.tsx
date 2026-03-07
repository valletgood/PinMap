export function Header() {
  return (
    <div className="relative z-40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* 배경 및 블러 효과 */}
      <div className="absolute inset-0 bg-[#6938D3]/60 backdrop-blur-sm border-b border-gray/30"></div>

      {/* 헤더 컨텐츠 */}
      <div className="relative h-[87px] text-white flex items-center px-4 md:px-6">123</div>
    </div>
  );
}
