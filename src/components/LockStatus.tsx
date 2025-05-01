import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

interface LockStatusProps {
  isLocked: boolean;
}

const LockStatus: React.FC<LockStatusProps> = ({ isLocked }) => {
  const [status, setStatus] = useState(isLocked);

  useEffect(() => {
    // MQTTクライアントの設定を読み込む
    const config = require('../config/mqtt.config.json');
    const client = mqtt.connect(config.brokerUrl);
    const topic = config.topic;

    client.on('connect', () => {
      console.log('MQTT接続成功');
      client.subscribe(topic);
    });

    client.on('message', (receivedTopic, message) => {
      console.log('メッセージを受信:', {
        topic: receivedTopic,
        message: message.toString(),
        rawMessage: message
      });
      
      if (receivedTopic === topic) {
        const messageStr = message.toString();
        console.log('メッセージを処理:', messageStr);
        
        if (messageStr === 'opened') {
          setStatus(false); // 解錠中
        } else if (messageStr === 'locked') {
          setStatus(true);  // 施錠中
        }
      }
    });

    // クリーンアップ関数
    return () => {
      client.end();
    };
  }, []); 

  return (
    <div className="lock-status">
      <div className={`status-indicator ${status ? 'locked' : 'opened'}`}>
        {status ? '施錠中' : '解錠中'}
      </div>
    </div>
  );
};

export default LockStatus;