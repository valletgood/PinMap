# PinMap

Next.js + TypeScript + Tailwind CSS + Drizzle ORM 프로젝트

## 시작하기

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
DATABASE_URL=your_supabase_connection_string
```

#### Supabase 연결 문자열 가져오기

1. [Supabase](https://supabase.com) 프로젝트에 로그인
2. 프로젝트 설정 → Database → Connection string
3. "URI" 또는 "Connection pooling" 옵션에서 연결 문자열 복사
4. 형식: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## Drizzle ORM 사용

### 스키마 생성

```bash
npm run db:generate
```

### 마이그레이션 실행

```bash
npm run db:migrate
```

### 데이터베이스에 직접 푸시

```bash
npm run db:push
```

### Drizzle Studio 실행

```bash
npm run db:studio
```

## 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Drizzle ORM** - 타입 안전한 SQL ORM
- **Supabase** - PostgreSQL 데이터베이스 (호스팅)
