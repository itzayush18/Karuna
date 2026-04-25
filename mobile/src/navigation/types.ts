import { Task } from '../types/api';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { task: Task };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Reports: undefined;
  Tasks: undefined;
  Notifications: undefined;
  Profile: undefined;
};
