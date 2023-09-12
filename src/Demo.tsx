import 'react-calendar/dist/Calendar.css';

import React, {
  useContext,
  useState,
} from 'react';

import { match } from 'ts-pattern';

import {
  Chat,
  ChatWindow,
  Launcher,
  RuntimeAPIProvider,
  SessionStatus,
  SystemResponse,
  TurnType,
  UserResponse,
} from '@voiceflow/react-chat';

import CustomCarousel from './components/CustomCarousel';
import { LiveAgentStatus } from './components/LiveAgentStatus.component';
import { StreamedMessage } from './components/StreamedMessage.component';
import { RuntimeContext } from './context';
import { CustomMessage } from './custom-message.enum';
import { CalendarMessage } from './messages/CalendarMessage.component';
import { VideoMessage } from './messages/VideoMessage.component';
import { DemoContainer } from './styled';
import { useLiveAgent } from './use-live-agent.hook';

export const IMAGE = 'https://i.ibb.co/cFpjhbs/Group-1012.png';
export const AVATAR = 'https://i.ibb.co/M84hzr3/Group-1010.png';

export const Demo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { runtime } = useContext(RuntimeContext)!;
  const liveAgent = useLiveAgent();

  React.useEffect(() => {
    handleLaunch()
  }, [])

  const handleLaunch = async () => {
    setOpen(true);
    await runtime.launch();
  };

  const handleEnd = () => {
    runtime.setStatus(SessionStatus.ENDED);
    setOpen(false);
  };

  const handleSend = (message: string) => {
    if (liveAgent.isEnabled) {
      liveAgent.sendUserReply(message);
    } else {
      runtime.reply(message);
    }
  };

  if (!open) {
    return (
      <span
        style={{
          position: 'absolute',
          right: '2rem',
          bottom: '2rem',
        }}
      >
        <Launcher onClick={handleLaunch} />
      </span>
    );
  }

  return (
    <DemoContainer>
      <ChatWindow.Container style={{
        fontFamily: 'DM Sans'
      }}>
        <RuntimeAPIProvider {...runtime}>
          <Chat
          
            title="Adani Realty"
            description="Your real estate virtual assistant."
            image={IMAGE}
            avatar={AVATAR}
            withWatermark={false}
            startTime={runtime.session.startTime}
            hasEnded={runtime.isStatus(SessionStatus.ENDED)}
            isLoading={!runtime.session.turns.length}
            onStart={runtime.launch}
            onEnd={handleEnd}
            onSend={handleSend}
            onMinimize={handleEnd}
          >
            {liveAgent.isEnabled && <LiveAgentStatus talkToRobot={liveAgent.talkToRobot} />}
            {runtime.session.turns.map((turn, turnIndex) =>
              match(turn)
                .with({ type: TurnType.USER }, ({ id, type: _, ...rest }) => <UserResponse {...rest} key={id} />)
                .with({ type: TurnType.SYSTEM }, ({ id, type: _, ...rest }) => (
                  <SystemResponse
                    {...rest}
                    key={id}
                    Message={({ message, ...props }) => {
                        console.log(message)
                        return match(message)
                          .with({ type: 'carousel' }, () => <CustomCarousel message={message} />)
                          .with({ type: CustomMessage.CALENDAR }, ({ payload: { today } }) => (
                            <CalendarMessage {...props} value={new Date(today)} runtime={runtime} />
                          ))
                          .with({ type: CustomMessage.VIDEO }, ({ payload: url }) => <VideoMessage url={url} />)
                          .with({ type: CustomMessage.STREAMED_RESPONSE }, ({ payload: { getSocket } }) => <StreamedMessage getSocket={getSocket} />)
                          .with({ type: CustomMessage.PLUGIN }, ({ payload: { Message } }) => <Message />)
                          .otherwise(() => <SystemResponse.SystemMessage {...props} message={message} />)
                      }
                    }
                    avatar={AVATAR}
                    isLast={turnIndex === runtime.session.turns.length - 1}
                  />
                ))
                .exhaustive()
            )}
            {runtime.indicator && <SystemResponse.Indicator avatar={AVATAR} />}
          </Chat>
        </RuntimeAPIProvider>
      </ChatWindow.Container>
    </DemoContainer>
  );
};
