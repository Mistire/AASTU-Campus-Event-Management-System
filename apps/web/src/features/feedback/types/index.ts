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
