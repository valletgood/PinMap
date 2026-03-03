export interface LocationSearchResponse {
  display: number;
  lastBuildDate: string;
  start: number;
  total: number;
  items: Location[];
}

export interface Location {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}
