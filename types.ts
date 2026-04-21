export interface Config {
  api_key?: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    api_key: string;
  };
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

export interface Log {
  id: number;
  project_id: number;
  channel: string;
  event: string;
  created_at: string;
}

export type ProjectsResponse = Project[];
