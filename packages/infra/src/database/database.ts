import mongoose, { Schema, type ConnectOptions } from 'mongoose';

export interface DatabaseConfig {
  uri: string;
  options?: ConnectOptions;
}

export async function connectDatabase(config: DatabaseConfig): Promise<void> {
  try {
    await mongoose.connect(config.uri, {
      ...config.options,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function getMongooseConnection(): typeof mongoose {
  return mongoose;
}
