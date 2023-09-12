import React, { useRef } from 'react';

import {
  Avatar,
  Carousel,
  SystemResponse,
} from '@voiceflow/react-chat';

import { AVATAR } from '../Demo';

interface CaroselItemProps {
    title: string;
    description: string;
    image: string;
    actions: []
}

const CustomCarousel = (props: any) => {

    const CarouselDataArray = props.message.cards;
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

  return (

        <>
            <SystemResponse.Controls ref={controlsRef} />
            <SystemResponse.Container ref={containerRef} withImage scrollable>
                <Avatar avatar={AVATAR} />
                <Carousel cards={CarouselDataArray} controlsRef={controlsRef} containerRef={containerRef} />
            </SystemResponse.Container>
        </>

  )
}

export default CustomCarousel