import 'react-calendar/dist/Calendar.css';

import React, {
  useContext,
  useState,
} from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { match } from 'ts-pattern';

import {
  Chat,
  ChatWindow,
  Launcher,
  RuntimeAPIProvider,
  SessionStatus,
  SystemResponse,
  TurnProps,
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

export const IMAGE = 'https://i.ibb.co/nzr1pvg/Group-1051.png';
export const AVATAR = 'https://i.ibb.co/nzr1pvg/Group-1051.png';
export const TITLE = 'SOBHA Developers Assistant';

const firebaseConfig = {

  apiKey: "AIzaSyDa4-xVrMX57smdpqvq3vU_cw_YJHdGK9g",

  authDomain: "speakwiz-app.firebaseapp.com",

  projectId: "speakwiz-app",

  storageBucket: "speakwiz-app.appspot.com",

  messagingSenderId: "264031558",

  appId: "1:264031558:web:aaf1b2d3078125841da947",

  measurementId: "G-WBEN55T42T"

};


// Initialize Firebase

export const app = initializeApp(firebaseConfig);


export const Demo: React.FC = () => {

  const [turnsLocal, setTurnsLocal] = React.useState<TurnProps[]>([])
  
  const [open, setOpen] = useState(false);

  const { runtime } = useContext(RuntimeContext)!;
  const liveAgent = useLiveAgent();

  async function updateChatHistory(targetCollection: string, turns: TurnProps[], wholeSession: any){
    const lastTurn = turns[turns.length - 1];
    console.log(lastTurn)
    const { getFirestore, setDoc, collection, addDoc, doc } = await import(`@firebase/firestore/lite`)
    const db = getFirestore(app);

    const newChatCollection = await addDoc(collection(db, targetCollection), {...lastTurn});
    console.log(wholeSession.userID, lastTurn.timestamp)
    await setDoc(doc(db, `sobha/chats/collections/${wholeSession.userID}`), {ts: lastTurn.timestamp, userID: wholeSession.userID}, {merge: true}).catch((err) => console.log(err));
  }

  React.useEffect(() => {
    console.log('WHAT THE FUKKK')
    if(runtime.session.turns.length > turnsLocal.length){
  
      console.log(runtime.session.userID);
      updateChatHistory(`sobha/chats/${runtime.session.userID}`, runtime.session.turns, runtime.session)
      setTurnsLocal(runtime.session.turns);
    }
  }, [runtime?.session]);
  

  React.useEffect(() => {
    handleLaunch()
  }, [])

  const handleLaunch = async () => {
    console.log('hi ;)')
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
      <ChatWindow.Container>
        <RuntimeAPIProvider {...runtime}>
          <Chat
            title={`${TITLE}`}
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
                      const returnState = React.useMemo(() => {
                        return match(message)
                        .with({ type: 'carousel' }, () => <CustomCarousel message={message} />)
                        .with({ type: CustomMessage.CALENDAR }, ({ payload: { today } }) => (
                          <CalendarMessage {...props} value={new Date(today)} runtime={runtime} />
                        ))
                        .with({ type: CustomMessage.VIDEO }, ({ payload: url }) => <VideoMessage url={url} />)
                        .with({ type: CustomMessage.STREAMED_RESPONSE }, ({ payload: { getSocket } }) => <StreamedMessage getSocket={getSocket} />)
                        .with({ type: CustomMessage.PLUGIN }, ({ payload: { Message } }) => <Message />)
                        .otherwise(() => <SystemResponse.SystemMessage {...props} message={message} />)
                      }, [message]);
                      return returnState
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
