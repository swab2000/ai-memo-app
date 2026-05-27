create extension if not exists "pgcrypto";

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'personal',
  tags text[] not null default '{}',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists memos_updated_at_idx on public.memos ("updatedAt" desc);
create index if not exists memos_category_idx on public.memos (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

drop trigger if exists set_memos_updated_at on public.memos;
create trigger set_memos_updated_at
before update on public.memos
for each row
execute function public.set_updated_at();

alter table public.memos disable row level security;

grant select, insert, update, delete on table public.memos to anon, authenticated, service_role;

insert into public.memos (
  id,
  title,
  content,
  category,
  tags,
  "createdAt",
  "updatedAt"
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '프로젝트 회의 준비',
    E'다음 주 월요일 오전 10시 프로젝트 킥오프 미팅을 위한 준비사항:\n\n- 프로젝트 범위 정의서 작성\n- 팀원별 역할 분담\n- 일정 계획 수립\n- 필요한 리소스 정리',
    'work',
    array['회의', '프로젝트', '준비'],
    '2026-05-25T04:37:00.000Z',
    '2026-05-25T04:37:00.000Z'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'React 18 새로운 기능 학습',
    E'React 18에서 새로 추가된 기능들을 학습해야 함:\n\n1. Concurrent Features\n2. Automatic Batching\n3. Suspense 개선사항\n4. useId Hook\n5. useDeferredValue Hook\n\n이번 주말에 공식 문서를 읽고 간단한 예제를 만들어보자.',
    'study',
    array['React', '학습', '개발'],
    '2026-05-22T04:37:00.000Z',
    '2026-05-26T04:37:00.000Z'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '새로운 앱 아이디어: 습관 트래커',
    E'매일 실천하고 싶은 습관들을 관리할 수 있는 앱:\n\n핵심 기능:\n- 습관 등록 및 관리\n- 일일 체크인\n- 진행 상황 시각화\n- 목표 달성 알림\n- 통계 분석\n\n기술 스택: React Native + Supabase\n출시 목표: 3개월 후',
    'idea',
    array['앱개발', '습관', 'React Native'],
    '2026-05-20T04:37:00.000Z',
    '2026-05-24T04:37:00.000Z'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '주말 여행 계획',
    E'이번 주말 제주도 여행 계획:\n\n토요일:\n- 오전: 한라산 등반\n- 오후: 성산일출봉 관광\n- 저녁: 흑돼지 맛집 방문\n\n일요일:\n- 오전: 우도 관광\n- 오후: 쇼핑 및 기념품 구매\n- 저녁: 공항 이동\n\n준비물: 등산화, 카메라, 선크림',
    'personal',
    array['여행', '제주도', '주말'],
    '2026-05-17T04:37:00.000Z',
    '2026-05-19T04:37:00.000Z'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '독서 목록',
    E'올해 읽고 싶은 책들:\n\n개발 관련:\n- 클린 코드 (로버트 C. 마틴)\n- 리팩토링 2판 (마틴 파울러)\n- 시스템 디자인 인터뷰 (알렉스 쉬)\n\n자기계발:\n- 아토믹 해빗 (제임스 클리어)\n- 데일 카네기 인간관계론\n\n소설:\n- 82년생 김지영 (조남주)\n- 미드나잇 라이브러리 (매트 헤이그)',
    'personal',
    array['독서', '책', '자기계발'],
    '2026-05-12T04:37:00.000Z',
    '2026-05-12T04:37:00.000Z'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    '성능 최적화 아이디어',
    E'웹 애플리케이션 성능 최적화 방법들:\n\n프론트엔드:\n- 이미지 최적화 (WebP, lazy loading)\n- 코드 스플리팅\n- 번들 크기 최적화\n- 캐싱 전략\n\n백엔드:\n- 데이터베이스 쿼리 최적화\n- CDN 활용\n- 서버 사이드 렌더링\n- API 응답 캐싱\n\n모니터링:\n- Core Web Vitals 측정\n- 성능 예산 설정',
    'idea',
    array['성능', '최적화', '웹개발'],
    '2026-05-07T04:37:00.000Z',
    '2026-05-15T04:37:00.000Z'
  )
on conflict (id) do nothing;
