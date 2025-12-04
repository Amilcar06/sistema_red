import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
    clientId: string;
    promotionId?: string;
    channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
    status: 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
    message: string;
    metadata?: Record<string, any>;
    sentAt: Date;
    error?: string;
}

const NotificationLogSchema: Schema = new Schema({
    clientId: { type: String, required: true, index: true },
    promotionId: { type: String, required: false, index: true },
    channel: {
        type: String,
        required: true,
        enum: ['SMS', 'WHATSAPP', 'EMAIL', 'PUSH']
    },
    status: {
        type: String,
        required: true,
        enum: ['SENT', 'FAILED', 'DELIVERED', 'READ'],
        default: 'SENT'
    },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    sentAt: { type: Date, default: Date.now },
    error: { type: String }
});

export default mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
