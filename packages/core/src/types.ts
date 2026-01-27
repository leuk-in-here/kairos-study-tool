// Task Domain
export enum EisenhowerQuadrant {
    Q1_URGENT_IMPORTANT = 'Q1',
    Q2_NOT_URGENT_IMPORTANT = 'Q2',
    Q3_URGENT_NOT_IMPORTANT = 'Q3',
    Q4_NOT_URGENT_NOT_IMPORTANT = 'Q4',
    UNSORTED = 'UNSORTED',
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    SNOOZED = 'SNOOZED',
}

export interface Task {
    id: string; // UUID
    title: string;
    description?: string;
    status: TaskStatus;
    quadrant: EisenhowerQuadrant;
    sortOrder?: number; // For drag and drop ordering

    // Metadata
    dueDate?: number; // Timestamp
    reminderTime?: number; // Timestamp for notification
    energyLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    tags: string[];
    recurrenceRule?: string; // RRule string

    // Gamification
    pointsValue: number;

    // Timestamps
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
}

// Note Domain
export interface Note {
    id: string; // UUID
    title: string;
    content: string; // Markdown
    folderId?: string; // Optional folder
    tags: string[];

    // Backlinks/Wikilinks might be derived or stored here depending on performance needs
    linkedNoteIds: string[];

    createdAt: number;
    updatedAt: number;
}

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

// Gamification Domain
export interface UserStats {
    id: 'user_stats'; // Singleton

    // Scoring
    totalPoints: number;
    tokens: number;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    frozenDaysAvailable: number;

    // Leveling
    level: number;
}

// Flashcard Domain
export enum CardType {
    BASIC = 'BASIC',
    CLOZE = 'CLOZE',
    MCQ = 'MCQ',
}

export enum Rating {
    AGAIN = 1,
    HARD = 2,
    GOOD = 3,
    EASY = 4,
}

export interface Flashcard {
    id: string; // UUID
    deckId: string;
    type: CardType;
    front: string;
    back: string;

    // Advanced Card Data
    options?: string[]; // For MCQ
    correctAnswerIndex?: number; // For MCQ
    clozeContent?: string; // For Cloze (if different from front)
    clozeIndex?: number; // For Cloze (e.g., 1 for {{c1::...}})
    imageUrl?: string; // Base64 or URL

    // Spaced Repetition Data (SM-2)
    interval: number; // Days until next review
    repetition: number; // Consecutive successful reviews
    easeFactor: number; // Multiplier (default 2.5)
    nextReviewDate: number; // Timestamp

    createdAt: number;
    updatedAt: number;
}

export interface Deck {
    id: string; // UUID
    title: string;
    cardIds: string[];
}

export interface ActivityLog {
    id: string;
    date: string; // YYYY-MM-DD for heatmaps
    type: 'TASK_COMPLETE' | 'NOTE_CREATED' | 'STREAK_MAINTAINED' | 'FLASHCARD_REVIEW';
    referenceId?: string; // ID of task/note
    value: number; // Points earned or count
    metadata?: Record<string, any>; // Extra data (e.g., isNew for flashcards)
    timestamp: number;
}

// Calendar Domain
export interface CalendarEvent {
    id: string; // UUID
    title: string;
    description?: string;
    startTime: number; // Timestamp
    endTime: number; // Timestamp
    color?: string; // Hex or generic color name
    isAllDay?: boolean;
    createdAt: number;
    updatedAt: number;
}

// Settings Domain
export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    dailyWinConditionPoints: number; // e.g., 100 points to keep streak
    notificationEnabled: boolean;
    quietHoursStart?: string; // HH:mm
    quietHoursEnd?: string; // HH:mm

    // Clock Settings
    timeZone?: string; // IANA string e.g. 'America/New_York' or 'GMT+8'
    is24Hour?: boolean;
    showSeconds?: boolean;
}
