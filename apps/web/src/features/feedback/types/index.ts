export interface FeedbackRecord {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
    event: {
        title: string;
    };
}

// ─── New structured feedback types ───────────────────────────────────────────

export type FeedbackQuestionType = 'RATING' | 'TEXT' | 'SHORT_TEXT' | 'MULTIPLE_CHOICE' | 'SCALE';

export interface FeedbackQuestion {
    id: string;
    label: string;
    type: FeedbackQuestionType;
    options: string[] | null;
    isRequired: boolean;
    order: number;
}

export interface FeedbackFormData {
    alreadySubmitted: boolean;
    eventTitle: string;
    eventDate: string;
    venueName: string | null;
    attendeeName: string;
    questions: FeedbackQuestion[];
}

export interface FeedbackAnswerPayload {
    questionId: string;
    value: string;
}

export interface FeedbackTemplate {
    id: string;
    name: string;
    createdBy: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    questions: FeedbackQuestion[];
}

export interface FeedbackAnswer {
    id: string;
    questionId: string;
    value: string;
    question: {
        label: string;
        type: FeedbackQuestionType;
    };
}

export interface FeedbackAttendee {
    displayName: string;
    displayEmail: string;
    userId?: string; // only in admin view
}

export interface FeedbackResponse {
    id: string;
    createdAt: string;
    event: { id: string; title: string };
    attendee: FeedbackAttendee;
    answers: FeedbackAnswer[];
}

export interface FeedbackResponsesPage {
    data: FeedbackResponse[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface EventFeedbackSummary {
    eventId: string;
    eventTitle: string;
    totalResponses: number;
    avgRating: number | null;
    responses: FeedbackResponse[];
}
