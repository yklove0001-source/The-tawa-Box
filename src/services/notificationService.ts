import { OrderDetails } from '../types';
import { getApiUrl } from '../lib/api';

export interface AdminNotification {
  id: string;
  orderId: string;
  customerName: string;
  customerMobile: string;
  total: number;
  adminNumber: string;
  messageText: string;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
  channel: 'WhatsApp/SMS' | 'Web Push';
}

// Get admin notifications from localStorage
export const getAdminNotifications = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem('tawabox_admin_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Save a single notification log
const saveNotificationToStorage = (notification: AdminNotification) => {
  try {
    const current = getAdminNotifications();
    const updated = [notification, ...current];
    localStorage.setItem('tawabox_admin_notifications', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to preserve admin notification log', e);
  }
};

// Trigger notification to admin
export const triggerAdminNotification = async (order: OrderDetails): Promise<AdminNotification> => {
  const adminNumber = '9058028729';
  const itemSummary = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
  const messageText = `🔔 *New Order Received!*
*Order ID:* #${order.id}
*Customer:* ${order.userName} (${order.mobile})
*Total Amount:* Rs. ${order.total}
*Address:* ${order.address}
*Items:* ${itemSummary}
*Payment:* ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}
${order.notes ? `*Notes:* ${order.notes}` : ''}`;

  console.log(`[Admin Notification Service] Dispatching to ${adminNumber}:`, messageText);

  let dispatchStatus: 'sent' | 'failed' = 'sent';

  try {
    // Send to our backend proxy endpoint
    const response = await fetch(getApiUrl('/api/notifications/send'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminNumber,
        orderId: order.id,
        customerName: order.userName,
        customerMobile: order.mobile,
        total: order.total,
        messageText,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
      }),
    });

    if (!response.ok) {
      console.warn('Backend proxy notification response was not OK, falling back to local simulation logging.');
    }
  } catch (err) {
    console.error('Failed to notify backend proxy:', err);
  }

  const notificationRecord: AdminNotification = {
    id: 'NOTIF_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    orderId: order.id,
    customerName: order.userName,
    customerMobile: order.mobile,
    total: order.total,
    adminNumber,
    messageText,
    sentAt: new Date().toISOString(),
    status: dispatchStatus,
    channel: 'WhatsApp/SMS'
  };

  saveNotificationToStorage(notificationRecord);
  return notificationRecord;
};
