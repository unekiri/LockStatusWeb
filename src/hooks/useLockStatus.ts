import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

export type LockState = 'locked' | 'unlocked' | 'unknown';
export type Availability = 'online' | 'offline' | 'unknown';
export type Connection = 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface LockStatus {
  state: LockState;
  availability: Availability;
  connection: Connection;
  /** センサーが状態を観測した時刻（epoch秒）。時刻が未同期なら null。 */
  updatedAt: number | null;
  /** lock/status を一度でも受け取ったか。updatedAt が null の理由を分けるために要る。 */
  received: boolean;
}

interface Config {
  brokerUrl: string;
  statusTopic: string;
  availabilityTopic: string;
}

function readConfig(): Config {
  const brokerUrl = process.env.REACT_APP_MQTT_URL;
  if (!brokerUrl) {
    // ここで落とさないと「繋がらない」原因が接続エラーに紛れて分からなくなる。
    throw new Error(
      'REACT_APP_MQTT_URL が未設定です。.env.example を .env にコピーしてください。'
    );
  }
  return {
    brokerUrl,
    statusTopic: process.env.REACT_APP_MQTT_STATUS_TOPIC || 'lock/status',
    availabilityTopic:
      process.env.REACT_APP_MQTT_AVAILABILITY_TOPIC || 'lock/availability',
  };
}

function parseState(payload: string): { state: LockState; ts: number | null } {
  try {
    const parsed = JSON.parse(payload);
    const state = parsed.state;
    if (state === 'locked' || state === 'unlocked' || state === 'unknown') {
      return { state, ts: typeof parsed.ts === 'number' ? parsed.ts : null };
    }
  } catch {
    // 壊れたペイロードで解錠を表示するより不明のほうが安全。
  }
  return { state: 'unknown', ts: null };
}

export function useLockStatus(): LockStatus {
  const [status, setStatus] = useState<LockStatus>({
    state: 'unknown',
    availability: 'unknown',
    connection: 'connecting',
    updatedAt: null,
    received: false,
  });

  useEffect(() => {
    const config = readConfig();
    const client = mqtt.connect(config.brokerUrl, {
      reconnectPeriod: 5000,
      clean: true,
    });

    client.on('connect', () => {
      setStatus((prev) => ({ ...prev, connection: 'connected' }));
      // retain 済みの最新状態がこの subscribe で即座に届く。
      client.subscribe([config.statusTopic, config.availabilityTopic]);
    });

    client.on('reconnect', () => {
      setStatus((prev) => ({ ...prev, connection: 'reconnecting' }));
    });

    client.on('error', (error) => {
      console.error('MQTT接続エラー', error);
      setStatus((prev) => ({ ...prev, connection: 'error' }));
    });

    client.on('close', () => {
      // 接続が切れている間の表示は、最後に見た状態ではなく不明にする。
      setStatus((prev) =>
        prev.connection === 'connected'
          ? { ...prev, connection: 'reconnecting' }
          : prev
      );
    });

    client.on('message', (topic, payload) => {
      const text = payload.toString();

      if (topic === config.statusTopic) {
        const { state, ts } = parseState(text);
        setStatus((prev) => ({ ...prev, state, updatedAt: ts, received: true }));
        return;
      }

      if (topic === config.availabilityTopic) {
        const availability: Availability =
          text === 'online' || text === 'offline' ? text : 'unknown';
        setStatus((prev) => ({ ...prev, availability }));
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  return status;
}
