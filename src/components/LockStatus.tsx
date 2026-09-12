import React from 'react';
import { LockState, useLockStatus } from '../hooks/useLockStatus';

const LABELS: Record<LockState, string> = {
  locked: '施錠中',
  unlocked: '解錠中',
  unknown: '不明',
};

function formatUpdatedAt(updatedAt: number | null): string {
  if (updatedAt === null) {
    return '未受信';
  }
  return new Date(updatedAt * 1000).toLocaleString('ja-JP');
}

const LockStatus: React.FC = () => {
  const { state, availability, connection, updatedAt } = useLockStatus();

  // センサーが止まっている、またはブローカーに繋がっていない間の表示は、
  // 最後に見た状態ではなく「不明」にする。古い「施錠中」が一番危ない。
  const trusted = connection === 'connected' && availability === 'online';
  const displayed: LockState = trusted ? state : 'unknown';

  const warning = !trusted
    ? connection !== 'connected'
      ? 'MQTTブローカーに接続できていません'
      : 'センサーが応答していません'
    : null;

  return (
    <div className="lock-status">
      <div className={`status-indicator ${displayed}`}>{LABELS[displayed]}</div>

      {warning && <p className="status-warning">{warning}</p>}

      <dl className="status-detail">
        <dt>最終更新</dt>
        <dd>{formatUpdatedAt(updatedAt)}</dd>
        <dt>センサー</dt>
        <dd>{availability === 'online' ? '稼働中' : '停止/不明'}</dd>
        <dt>接続</dt>
        <dd>{connection === 'connected' ? '接続中' : '切断'}</dd>
      </dl>
    </div>
  );
};

export default LockStatus;
