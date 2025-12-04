import mongoose, { Schema, Document } from 'mongoose';

export interface IClientMetadata extends Document {
    clientId: string;
    preferences?: {
        preferredChannels?: string[];
        topics?: string[];
        doNotDisturb?: boolean;
    };
    behavior?: {
        lastClickDate?: Date;
        totalClicks?: number;
        categoryInterests?: Record<string, number>;
    };
    lastInteraction: Date;
}

const ClientMetadataSchema: Schema = new Schema({
    clientId: { type: String, required: true, unique: true, index: true },
    preferences: {
        preferredChannels: [{ type: String }],
        topics: [{ type: String }],
        doNotDisturb: { type: Boolean, default: false }
    },
    behavior: {
        lastClickDate: { type: Date },
        totalClicks: { type: Number, default: 0 },
        categoryInterests: { type: Map, of: Number }
    },
    lastInteraction: { type: Date, default: Date.now }
});

export default mongoose.model<IClientMetadata>('ClientMetadata', ClientMetadataSchema);
