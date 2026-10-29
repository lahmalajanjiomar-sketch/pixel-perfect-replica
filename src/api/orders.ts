// TODO: Replace with an authenticated payment-status API before accepting real orders.
export async function checkPaymentStatus(): Promise<boolean> { return false; }
// TODO: Allocate NUM atomically on the real order service. This is a session-only mock.
let nextOrderNumber = 1;
export function getOrderNumber(): string { return String(nextOrderNumber++).padStart(2, "0"); }