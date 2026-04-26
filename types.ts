export interface Config {
  api_key?: string;
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

/* Axios Response Types */

export type ProjectsResponse = Project[];

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    api_key: string;
  };
}

export interface CreateProjectResponse {
  success: boolean;
  project: {
    id: number;
    name: string;
  };
}

export interface CreateLogResponse {
  ok: boolean;
  id: number;
}
