import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SamplePaper {
    id: string;
    title: string;
    subject: string;
    year: bigint;
    description: string;
}
export interface MCQ {
    question: string;
    correctIndex: bigint;
    options: Array<string>;
}
export type Time = bigint;
export interface QuizAttempt {
    attemptId: string;
    subject: string;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Time;
    chapter: string;
}
export interface ForumReply {
    body: string;
    author: Principal;
    timestamp: Time;
    replyId: string;
    postId: string;
}
export interface ForumPost {
    title: string;
    subject: string;
    body: string;
    author: Principal;
    timestamp: Time;
    replies: Array<ForumReply>;
    postId: string;
}
export interface UserStudyTask {
    title: string;
    subject: string;
    completed: boolean;
    taskId: string;
    timestamp: Time;
}
export interface Subject {
    id: string;
    title: string;
    chapters: Array<Chapter>;
}
export interface UserProfile {
    bio?: string;
    name: string;
}
export interface Chapter {
    title: string;
    mcqs: Array<MCQ>;
    notes: string;
    number: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addForumPost(title: string, body: string, subject: string): Promise<string>;
    addForumReply(postId: string, body: string): Promise<string>;
    addStudyTask(title: string, subject: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllForumPosts(): Promise<Array<ForumPost>>;
    getAllSamplePapers(): Promise<Array<SamplePaper>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChapter(subjectId: string, chapterNumber: bigint): Promise<Chapter | null>;
    getChapterMCQs(subjectId: string, chapterNumber: bigint): Promise<Array<MCQ> | null>;
    getForumPostById(id: string): Promise<ForumPost | null>;
    getQuizAttemptsForCaller(): Promise<Array<QuizAttempt>>;
    getSamplePaperById(id: string): Promise<SamplePaper | null>;
    getSamplePapersBySubject(subject: string): Promise<Array<SamplePaper>>;
    getSubjectById(id: string): Promise<Subject | null>;
    getSubjects(): Promise<Array<Subject>>;
    getTasksForCaller(): Promise<Array<UserStudyTask>>;
    getUserCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVersion(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    markTaskCompleted(taskId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveQuizAttempt(subject: string, chapter: string, score: bigint, totalQuestions: bigint): Promise<void>;
}
