export const REQUEST_STATUSES = ['ASSIGNED', 'CONFIRMED', 'COMPLETED'] as const;
export const USER_STATUSES = ['active', 'pending', 'disabled'] as const;

export type RequestStatus = typeof REQUEST_STATUSES[number];
export type UserStatus = typeof USER_STATUSES[number];

