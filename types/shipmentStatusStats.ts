export interface ShipmentStatusStats {
    [key: string]: number;
    CONFIRMED: number;
    CLEARING_IN_PROGRESS: number;
    IN_TRANSIT: number;
    AT_PORT: number;
    PENDING_DOCS: number;
    ON_HOLD_BY_CUSTOMS: number;
    REJECTED: number;
}